
import { Octokit } from "@octokit/rest";
import { Document } from "../types";

const GITHUB_CONFIG_KEY = 'nova_kb_github_config';

interface GithubConfig {
    token: string;
    owner: string;
    repo: string;
}

// For Testing
let OctokitClass: any = Octokit;
export const _setOctokitClass = (cls: any) => OctokitClass = cls;

export const saveGithubConfig = (config: GithubConfig) => {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
};

export const getGithubConfig = (): GithubConfig | null => {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const syncToGithub = async (documents: Document[]): Promise<{ pushed: number; skipped: number }> => {
    const config = getGithubConfig();
    if (!config) throw new Error("GitHub configuration missing.");

    const octokit = new OctokitClass({ auth: config.token });

    let pushed = 0;
    let skipped = 0;

    for (const doc of documents) {
        const fileName = `doc-${doc.id}.html`;
        const content = `<!-- Title: ${doc.title} -->\n<!-- ID: ${doc.id} -->\n${doc.content}`;
        const encodedContent = btoa(unescape(encodeURIComponent(content))); // Handle UTF-8 for Base64

        try {
            // Check if file exists to get SHA
            let sha: string | undefined;
            try {
                const { data } = await octokit.repos.getContent({
                    owner: config.owner,
                    repo: config.repo,
                    path: fileName,
                });
                if (!Array.isArray(data)) {
                    sha = data.sha;
                }
            } catch (e) {
                // File doesn't exist, ignore error (will create new)
            }

            await octokit.repos.createOrUpdateFileContents({
                owner: config.owner,
                repo: config.repo,
                path: fileName,
                message: `Update ${doc.title || 'Untitled'}`,
                content: encodedContent,
                sha: sha,
            });
            pushed++;
        } catch (error) {
            console.error(`Failed to sync ${doc.title}`, error);
            skipped++;
        }
    }

    return { pushed, skipped };
};

export const pullFromGithub = async (): Promise<Document[]> => {
    const config = getGithubConfig();
    if (!config) throw new Error("GitHub configuration missing.");

    const octokit = new OctokitClass({ auth: config.token });
    const newDocs: Document[] = [];

    try {
        const { data } = await octokit.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path: '',
        });

        if (Array.isArray(data)) {
            for (const file of data) {
                if (file.name.startsWith('doc-') && file.name.endsWith('.html')) {
                    const { data: fileData } = await octokit.repos.getContent({
                        owner: config.owner,
                        repo: config.repo,
                        path: file.path,
                    });

                    if ('content' in fileData) {
                        const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
                        
                        // Extract Title and ID from comments (basic parsing)
                        const titleMatch = decodedContent.match(/<!-- Title: (.*?) -->/);
                        const idMatch = decodedContent.match(/<!-- ID: (.*?) -->/);
                        
                        // Clean content by removing metadata comments
                        const content = decodedContent.replace(/<!--.*?-->\n?/g, '');

                        newDocs.push({
                            id: idMatch ? idMatch[1] : file.name.replace('doc-', '').replace('.html', ''),
                            title: titleMatch ? titleMatch[1] : 'Imported Document',
                            content: content,
                            updatedAt: Date.now()
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to pull from GitHub", error);
        throw error;
    }

    return newDocs;
};
