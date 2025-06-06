import sqlite3
import os
from datetime import datetime
import json
import logging
from github import Github
import sys

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('build_history')

def initialize_db():
    """Create the database and tables if they don't exist"""
    db_dir = "data"
    os.makedirs(db_dir, exist_ok=True)
    
    conn = sqlite3.connect(os.path.join(db_dir, 'test_metrics.db'))
    c = conn.cursor()
    
    # Create main test runs table
    c.execute('''
    CREATE TABLE IF NOT EXISTS test_runs (
        id INTEGER PRIMARY KEY,
        repository TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        total INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        failed INTEGER NOT NULL,
        skipped INTEGER,
        duration REAL,
        pass_rate REAL,
        build_id TEXT,
        commit_hash TEXT
    )
    ''')
    
    # Create table for test-level details (optional)
    c.execute('''
    CREATE TABLE IF NOT EXISTS test_details (
        id INTEGER PRIMARY KEY,
        run_id INTEGER,
        test_name TEXT NOT NULL,
        status TEXT NOT NULL,
        duration REAL,
        is_critical BOOLEAN,
        error_message TEXT,
        FOREIGN KEY (run_id) REFERENCES test_runs (id)
    )
    ''')
    
    conn.commit()
    conn.close()

def store_historical_data(repository, test_results):
    """Store test results in SQLite database"""
    initialize_db()
    
    conn = sqlite3.connect('data/test_metrics.db')
    c = conn.cursor()
    
    # Calculate pass rate
    pass_rate = (test_results["passed"] / test_results["total"]) * 100 if test_results["total"] > 0 else 0
    
    # Insert run data
    c.execute('''
    INSERT INTO test_runs (
        repository, timestamp, total, passed, failed, 
        skipped, duration, pass_rate, build_id, commit_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        repository,
        datetime.now().isoformat(),
        test_results["total"],
        test_results["passed"],
        test_results["failed"],
        test_results.get("skipped", 0),
        test_results.get("duration", 0),
        pass_rate,
        test_results.get("build_id"),
        test_results.get("commit_hash")
    ))
    
    run_id = c.lastrowid
    
    # If there are individual test details, store them too
    if "tests" in test_results:
        for test in test_results["tests"]:
            c.execute('''
            INSERT INTO test_details (
                run_id, test_name, status, duration, is_critical, error_message
            ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                run_id,
                test["name"],
                test["status"],
                test.get("duration", 0),
                test.get("is_critical", False),
                test.get("error_message")
            ))
    
    conn.commit()
    conn.close()
    
    return run_id

def store_build_history(token, repo_name):
    """Store build status history for a repository"""
    g = Github(token)
    repo = g.get_repo(repo_name)
    
    logger.info(f"Collecting build history for {repo_name}")
    
    # Get workflow runs
    workflow_runs = repo.get_workflow_runs()
    
    # Create history data structure
    history_data = []
    
    for run in workflow_runs:
        # Skip GitHub Pages builds and other automated builds
        if should_exclude_build(run):
            continue
            
        # Extract the key information
        try:
            # Calculate duration safely
            duration = 0
            if run.updated_at and run.created_at:
                duration = (run.updated_at - run.created_at).total_seconds()
                
            # Get commit message safely
            commit_message = "No message"
            commit_author = "Unknown"
            
            # Get the commit author (not the workflow actor)
            if run.head_commit:
                if hasattr(run.head_commit, 'message'):
                    commit_message = run.head_commit.message
                
                # Extract actual commit author 
                if hasattr(run.head_commit, 'author') and run.head_commit.author:
                    if hasattr(run.head_commit.author, 'name') and run.head_commit.author.name:
                        commit_author = run.head_commit.author.name
                    elif hasattr(run.head_commit.author, 'login') and run.head_commit.author.login:
                        commit_author = run.head_commit.author.login
            
            history_data.append({
                'run_id': run.id,
                'repository': repo_name,
                'repo_owner': repo_name.split('/')[0],
                'repo_name': repo_name.split('/')[1],
                'timestamp': run.created_at.isoformat(),
                'status': run.conclusion,
                'branch': run.head_branch,
                'commit_id': run.head_sha,
                'commit_message': commit_message,
                'duration': duration,
                'author': commit_author  # Using actual commit author name, not workflow actor
            })
        except Exception as e:
            logger.error(f"Error processing run {run.id}: {str(e)}")
            continue
    
    # Store the data
    history_dir = 'data/history'
    os.makedirs(history_dir, exist_ok=True)
    
    filename = f"{history_dir}/{repo_name.replace('/', '_')}_build_history.json"
    logger.info(f"Saving build history to {filename}")
    
    # Append to existing data if file exists
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            existing_data = json.load(f)
            
        # Filter out duplicates based on run_id
        existing_run_ids = set(item['run_id'] for item in existing_data)
        new_items = [item for item in history_data if item['run_id'] not in existing_run_ids]
        
        logger.info(f"Adding {len(new_items)} new build records to existing {len(existing_data)}")
        
        # Combine and save
        combined_data = existing_data + new_items
        with open(filename, 'w') as f:
            json.dump(combined_data, f, indent=2)
    else:
        logger.info(f"Creating new build history file with {len(history_data)} records")
        # Create new file
        with open(filename, 'w') as f:
            json.dump(history_data, f, indent=2)
    
    # Return the history data
    return history_data  

def should_exclude_build(run):
    """Determine if this build should be excluded from analytics"""
    # Exclude GitHub Pages automated builds
    if run.actor and run.actor.login in ["github-pages[bot]", "github-actions[bot]"]:
        return True
        
    # Check workflow name if available - using workflow_id instead of workflow
    # The previous code tried to use run.workflow.name which doesn't exist
    workflow_name = ""
    try:
        if hasattr(run, 'name') and run.name:
            workflow_name = run.name.lower()
        elif hasattr(run, 'event') and run.event:
            workflow_name = run.event.lower()
    except:
        pass
    
    # Use workflow name information for filtering
    if workflow_name:
        # Exclude pages deployment workflows
        if "pages" in workflow_name and "deploy" in workflow_name:
            return True
        
        # Exclude non-testing deployment workflows
        if any(term in workflow_name for term in ["deploy", "publish", "release"]):
            # But keep if it also includes testing terms
            if not any(term in workflow_name for term in ["test", "lint", "check"]):
                return True
    
    return False

def main():
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('build_history')
    
    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        logger.error("GITHUB_TOKEN not provided")
        sys.exit(1)
    
    # Get repository owner from environment or use the current repo's owner
    repo_owner = os.environ.get('GITHUB_REPOSITORY_OWNER')
    if not repo_owner:
        try:
            # Try to extract from GITHUB_REPOSITORY (owner/repo format)
            github_repo = os.environ.get('GITHUB_REPOSITORY', '').split('/')
            if len(github_repo) > 1:
                repo_owner = github_repo[0]
            else:
                # Fallback to current directory name as a last resort
                repo_owner = os.path.basename(os.path.abspath(os.path.join(os.getcwd(), '..')))
        except:
            logger.error("Could not determine repository owner")
            sys.exit(1)
    
    logger.info(f"Using repository owner: {repo_owner}")
        
    # Read repositories from config.js
    with open('config.js', 'r') as f:
        config_content = f.read()
        
    # Parse repositories list from config.js
    repos = []
    # Simple parsing to extract repository names
    try:
        repos_section = config_content.split('REPOSITORIES = [')[1].split('];')[0]
        repo_blocks = repos_section.split('{')
        for block in repo_blocks:
            if '"name":' in block:
                name = block.split('"name":')[1].split(',')[0].strip().strip('"')
                if name:
                    repos.append(f"{repo_owner}/{name}")
    except Exception as e:
        logger.error(f"Failed to parse config.js: {e}")
        
    if not repos:
        logger.error("No repositories found in config.js")
        sys.exit(1)
        
    # Regenerate all data files
    # First, delete existing files
    history_dir = 'data/history'
    if os.path.exists(history_dir):
        for file in os.listdir(history_dir):
            if file.endswith('_build_history.json') or file == 'build_history_combined.json':
                os.remove(os.path.join(history_dir, file))
                logger.info(f"Deleted existing file: {file}")
    
    # Process each repository
    all_history = []
    for repo_name in repos:
        logger.info(f"Processing repository: {repo_name}")
        history = store_build_history(token, repo_name)
        all_history.extend(history)
    
    # Save combined history
    os.makedirs(history_dir, exist_ok=True)
    combined_file = f"{history_dir}/build_history_combined.json"
    
    logger.info(f"Saving combined history to {combined_file}")
    with open(combined_file, 'w') as f:
        json.dump(all_history, f, indent=2)
    
    logger.info(f"Sample data structure for verification:")
    if all_history and len(all_history) > 0:
        sample = all_history[0]
        logger.info(f"Fields: {', '.join(sample.keys())}")
        logger.info(f"Sample record: {json.dumps(sample, indent=2)}")

if __name__ == "__main__":
    main()