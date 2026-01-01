
import { describe, it, expect, vi, beforeEach } from '../lib/vitest';
import { syncToGithub, saveGithubConfig, _setOctokitClass } from './githubService';

describe('GitHub Service', () => {
    const mockCreateOrUpdate = vi.fn();
    const mockGetContent = vi.fn();
    
    // Mock Class
    class MockOctokit {
        repos = {
            createOrUpdateFileContents: mockCreateOrUpdate,
            getContent: mockGetContent
        }
    }

    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();
        _setOctokitClass(MockOctokit);
    });

    it('should throw error if config is missing', async () => {
        await expect(syncToGithub([])).rejects.toThrow('GitHub configuration missing');
    });

    it('should push documents successfully', async () => {
        // Setup config
        saveGithubConfig({ token: 'abc', owner: 'me', repo: 'notes' });

        // Mock file existence check (file not found -> creates new)
        mockGetContent.mockRejectedValue({ status: 404 });
        mockCreateOrUpdate.mockResolvedValue({ status: 200 });

        const docs = [{ id: '1', title: 'Test', content: '<p>Hi</p>', updatedAt: 123 }];
        
        const result = await syncToGithub(docs);

        expect(result.pushed).toBe(1);
        expect(mockCreateOrUpdate).toHaveBeenCalled();
    });

    it('should handle push failures gracefully', async () => {
         saveGithubConfig({ token: 'abc', owner: 'me', repo: 'notes' });
         
         // Simulate API failure
         mockGetContent.mockRejectedValue({ status: 500 }); // Unexpected error during check
         
         const docs = [{ id: '1', title: 'Test', content: '<p>Hi</p>', updatedAt: 123 }];
         const result = await syncToGithub(docs);

         expect(result.pushed).toBe(0);
         expect(result.skipped).toBe(1);
    });
});
