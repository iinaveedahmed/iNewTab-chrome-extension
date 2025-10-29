/**
 * Unit tests for ChromeStorage module
 */

// Load the ChromeStorage module
require('../../src/js/modules/chrome-storage.js');

describe('ChromeStorage', () => {
    let storage;

    beforeEach(() => {
        storage = new ChromeStorage();
    });

    describe('saveTasks', () => {
        it('should save tasks successfully', async () => {
            const mockTasks = [createMockTask()];

            chrome.storage.local.set.mockImplementation((data, callback) => {
                callback();
            });

            const result = await storage.saveTasks(mockTasks);

            expect(result).toBe(true);
            expect(chrome.storage.local.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    tasks: mockTasks,
                    lastUpdated: expect.any(String)
                }),
                expect.any(Function)
            );
        });

        it('should handle save errors', async () => {
            const mockTasks = [createMockTask()];

            chrome.storage.local.set.mockImplementation((data, callback) => {
                chrome.runtime.lastError = new Error('Storage error');
                callback();
            });

            const result = await storage.saveTasks(mockTasks);

            expect(result).toBe(false);
            chrome.runtime.lastError = null; // Reset
        });
    });

    describe('loadTasks', () => {
        it('should load tasks successfully', async () => {
            const mockTasks = [createMockTask()];

            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({ tasks: mockTasks });
            });

            const result = await storage.loadTasks();

            expect(result).toEqual(mockTasks);
            expect(chrome.storage.local.get).toHaveBeenCalledWith(['tasks'], expect.any(Function));
        });

        it('should return empty array when no tasks exist', async () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({});
            });

            const result = await storage.loadTasks();

            expect(result).toEqual([]);
        });

        it('should handle load errors', async () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                chrome.runtime.lastError = new Error('Load error');
                callback({});
            });

            const result = await storage.loadTasks();

            expect(result).toEqual([]);
            chrome.runtime.lastError = null; // Reset
        });
    });

    describe('saveAuthStatus', () => {
        it('should save auth status successfully', async () => {
            chrome.storage.local.set.mockImplementation((data, callback) => {
                callback();
            });

            const result = await storage.saveAuthStatus(true);

            expect(result).toBe(true);
            expect(chrome.storage.local.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    isAuthenticated: true,
                    authTime: expect.any(String)
                }),
                expect.any(Function)
            );
        });
    });

    describe('loadAuthStatus', () => {
        it('should load auth status successfully', async () => {
            const mockAuthData = {
                isAuthenticated: true,
                authTime: new Date().toISOString()
            };

            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback(mockAuthData);
            });

            const result = await storage.loadAuthStatus();

            expect(result.isAuthenticated).toBe(true);
            expect(result.authTime).toBe(mockAuthData.authTime);
        });

        it('should return default values when no auth data exists', async () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({});
            });

            const result = await storage.loadAuthStatus();

            expect(result.isAuthenticated).toBe(false);
            expect(result.authTime).toBeNull();
        });
    });

    describe('saveCachedNews', () => {
        it('should save news data successfully', async () => {
            const mockNews = [
                { title: 'Test News', link: 'https://example.com' }
            ];

            chrome.storage.local.set.mockImplementation((data, callback) => {
                callback();
            });

            const result = await storage.saveCachedNews(mockNews);

            expect(result).toBe(true);
            expect(chrome.storage.local.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    cachedNews: mockNews,
                    lastNewsUpdate: expect.any(String)
                }),
                expect.any(Function)
            );
        });
    });

    describe('loadCachedNews', () => {
        it('should load cached news successfully', async () => {
            const mockNewsData = {
                cachedNews: [{ title: 'Test', link: 'https://example.com' }],
                lastNewsUpdate: new Date().toISOString()
            };

            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback(mockNewsData);
            });

            const result = await storage.loadCachedNews();

            expect(result.news).toEqual(mockNewsData.cachedNews);
            expect(result.lastUpdate).toEqual(new Date(mockNewsData.lastNewsUpdate));
        });

        it('should return empty data when no news exists', async () => {
            chrome.storage.local.get.mockImplementation((keys, callback) => {
                callback({});
            });

            const result = await storage.loadCachedNews();

            expect(result.news).toEqual([]);
            expect(result.lastUpdate).toBeNull();
        });
    });

    describe('clearAll', () => {
        it('should clear all storage successfully', async () => {
            chrome.storage.local.clear.mockImplementation((callback) => {
                callback();
            });

            const result = await storage.clearAll();

            expect(result).toBe(true);
            expect(chrome.storage.local.clear).toHaveBeenCalled();
        });

        it('should handle clear errors', async () => {
            chrome.storage.local.clear.mockImplementation((callback) => {
                chrome.runtime.lastError = new Error('Clear error');
                callback();
            });

            const result = await storage.clearAll();

            expect(result).toBe(false);
            chrome.runtime.lastError = null; // Reset
        });
    });

    describe('getStorageInfo', () => {
        it('should get storage usage info', async () => {
            const mockUsage = 12345;

            chrome.storage.local.getBytesInUse.mockImplementation((keys, callback) => {
                callback(mockUsage);
            });

            const result = await storage.getStorageInfo();

            expect(result).toBe(mockUsage);
            expect(chrome.storage.local.getBytesInUse).toHaveBeenCalledWith(null, expect.any(Function));
        });

        it('should handle storage info errors', async () => {
            chrome.storage.local.getBytesInUse.mockImplementation((keys, callback) => {
                chrome.runtime.lastError = new Error('Info error');
                callback(0);
            });

            const result = await storage.getStorageInfo();

            expect(result).toBe(0);
            chrome.runtime.lastError = null; // Reset
        });
    });
});