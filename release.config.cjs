module.exports = {
    branches: ['main'],
    tagFormat: '${version}',
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                releaseRules: [
                    { type: 'breaking', release: 'major' },
                    { type: 'feat', release: 'minor' },
                    { type: 'fix', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                    { type: 'security', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    { type: 'chore', release: false },
                    { type: 'ci', release: false },
                    { type: 'docs', release: false },
                    { type: 'test', release: false },
                ],
            },
        ],
        '@semantic-release/release-notes-generator',
        ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
        ['@semantic-release/npm', { npmPublish: false }],
        [
            '@semantic-release/git',
            {
                assets: ['package.json', 'package-lock.json'],
                message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
            },
        ],
        ['@semantic-release/github', { assets: ['CHANGELOG.md'] }],
    ],
};
