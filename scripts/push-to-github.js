#!/usr/bin/env node
/**
 * Push changes to GitHub with optional token authentication.
 *
 * Setup:
 * 1. Create a Personal Access Token (PAT) at GitHub:
 *    Settings → Developer settings → Personal access tokens → Generate new token (classic)
 *    Enable scope: repo
 *
 * 2. Set the token once (choose one):
 *    Windows (PowerShell, this session only):
 *      $env:GITHUB_TOKEN = "ghp_yourTokenHere"
 *    Windows (permanent, user env):
 *      [System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_yourTokenHere", "User")
 *    Or run and type when prompted:
 *      node scripts/push-to-github.js
 *
 * 3. Run: node scripts/push-to-github.js
 *    Or: npm run push
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const REPO_ROOT = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
    const result = spawnSync(cmd, args, {
        cwd: REPO_ROOT,
        stdio: opts.silent ? 'pipe' : 'inherit',
        shell: true,
        ...opts
    });
    if (result.status !== 0 && !opts.allowFail) {
        process.exit(result.status);
    }
    return result;
}

function runOut(cmd, args) {
    const result = run(cmd, args, { silent: true, allowFail: true });
    return result.status === 0 ? (result.stdout || '').toString().trim() : '';
}

function main() {
    console.log('OGU Offline Site — Push to GitHub\n');

    // Check we're in a git repo
    const topLevel = runOut('git', ['rev-parse', '--show-toplevel']);
    if (!topLevel || path.resolve(topLevel) !== REPO_ROOT) {
        console.error('Not a git repository or not at repo root. Run: git init');
        process.exit(1);
    }

    // Remote
    const remoteUrl = runOut('git', ['config', '--get', 'remote.origin.url']);
    if (!remoteUrl) {
        console.error('No remote "origin" set. Add it with: git remote add origin https://github.com/YOUR_USER/OGU_Offline_Site.git');
        process.exit(1);
    }

    let pushUrl = remoteUrl;
    let token = process.env.GITHUB_TOKEN;

    if (!token) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('GITHUB_TOKEN not set. Paste your GitHub Personal Access Token (or press Enter to push without token): ', (answer) => {
            rl.close();
            token = (answer || '').trim();
            if (token) {
                pushUrl = injectToken(remoteUrl, token);
            }
            doPush(pushUrl);
        });
    } else {
        pushUrl = injectToken(remoteUrl, token);
        doPush(pushUrl);
    }
}

function injectToken(url, token) {
    // https://github.com/user/repo.git -> https://TOKEN@github.com/user/repo.git
    if (url.startsWith('https://') && !url.includes('@')) {
        return url.replace('https://', `https://${token}@`);
    }
    if (url.startsWith('http://') && !url.includes('@')) {
        return url.replace('http://', `http://${token}@`);
    }
    return url;
}

function doPush(pushUrl) {
    let branch = runOut('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (!branch || branch === 'HEAD') branch = 'main';

    // Status
    const status = runOut('git', ['status', '--porcelain']);
    if (!status) {
        console.log('Nothing to commit. Working tree clean.');
        process.exit(0);
    }

    console.log('Staging changes...');
    run('git', ['add', '.']);

    console.log('Committing...');
    const msg = process.argv[2] || 'Update OGU site: navbar, message window, assets';
    run('git', ['commit', '-m', msg]);

    console.log('Pushing to origin/' + branch + '...');
    run('git', ['push', pushUrl, branch]);

    console.log('\nDone. Changes are on GitHub.');
}

main();
