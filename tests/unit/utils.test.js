/**
 * Unit tests for utility functions
 */

// Load the utilities module
require('../../src/js/utils/helpers.js');

describe('Utils', () => {
    describe('safe', () => {
        it('should execute function safely and return result', () => {
            const result = Utils.safe(() => 'test result');
            expect(result).toBe('test result');
        });

        it('should catch errors and return null', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const result = Utils.safe(() => {
                throw new Error('Test error');
            });
            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('formatDueDate', () => {
        beforeEach(() => {
            // Mock current date to 2023-10-15
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-10-15T12:00:00Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return empty string for null/undefined date', () => {
            expect(Utils.formatDueDate(null)).toBe('');
            expect(Utils.formatDueDate(undefined)).toBe('');
        });

        it('should return "Today" for today\'s date', () => {
            const result = Utils.formatDueDate('2023-10-15');
            expect(result.text).toBe('Today');
            expect(result.class).toBe('today');
        });

        it('should return "Tomorrow" for tomorrow\'s date', () => {
            const result = Utils.formatDueDate('2023-10-16');
            expect(result.text).toBe('Tomorrow');
            expect(result.class).toBe('');
        });

        it('should return date with overdue class for past dates', () => {
            const result = Utils.formatDueDate('2023-10-14');
            expect(result.class).toBe('overdue');
        });

        it('should return formatted date for future dates', () => {
            const result = Utils.formatDueDate('2023-10-20');
            expect(result.text).toMatch(/10\/20\/2023/);
            expect(result.class).toBe('');
        });
    });

    describe('getTimeAgo', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-10-15T12:00:00Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return "just now" for very recent dates', () => {
            const recent = new Date('2023-10-15T11:59:30Z');
            expect(Utils.getTimeAgo(recent)).toBe('just now');
        });

        it('should return minutes ago', () => {
            const fiveMinutesAgo = new Date('2023-10-15T11:55:00Z');
            expect(Utils.getTimeAgo(fiveMinutesAgo)).toBe('5m ago');
        });

        it('should return hours ago', () => {
            const twoHoursAgo = new Date('2023-10-15T10:00:00Z');
            expect(Utils.getTimeAgo(twoHoursAgo)).toBe('2h ago');
        });

        it('should return days ago', () => {
            const twoDaysAgo = new Date('2023-10-13T12:00:00Z');
            expect(Utils.getTimeAgo(twoDaysAgo)).toBe('2d ago');
        });
    });

    describe('debounce', () => {
        it('should debounce function calls', (done) => {
            const mockFn = jest.fn();
            const debouncedFn = Utils.debounce(mockFn, 100);

            // Call multiple times rapidly
            debouncedFn('call1');
            debouncedFn('call2');
            debouncedFn('call3');

            // Should not be called yet
            expect(mockFn).not.toHaveBeenCalled();

            // Wait for debounce delay
            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1);
                expect(mockFn).toHaveBeenCalledWith('call3');
                done();
            }, 150);
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = Utils.generateId();
            const id2 = Utils.generateId();

            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email formats', () => {
            expect(Utils.isValidEmail('test@example.com')).toBe(true);
            expect(Utils.isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid email formats', () => {
            expect(Utils.isValidEmail('invalid-email')).toBe(false);
            expect(Utils.isValidEmail('test@')).toBe(false);
            expect(Utils.isValidEmail('@domain.com')).toBe(false);
            expect(Utils.isValidEmail('')).toBe(false);
        });
    });

    describe('deepClone', () => {
        it('should clone primitive values', () => {
            expect(Utils.deepClone(42)).toBe(42);
            expect(Utils.deepClone('string')).toBe('string');
            expect(Utils.deepClone(true)).toBe(true);
            expect(Utils.deepClone(null)).toBe(null);
        });

        it('should clone arrays', () => {
            const original = [1, 2, { nested: 'value' }];
            const cloned = Utils.deepClone(original);

            expect(cloned).not.toBe(original);
            expect(cloned).toEqual(original);
            expect(cloned[2]).not.toBe(original[2]);
        });

        it('should clone objects', () => {
            const original = {
                simple: 'value',
                nested: {
                    deep: 'property'
                },
                array: [1, 2, 3]
            };
            const cloned = Utils.deepClone(original);

            expect(cloned).not.toBe(original);
            expect(cloned).toEqual(original);
            expect(cloned.nested).not.toBe(original.nested);
            expect(cloned.array).not.toBe(original.array);
        });

        it('should clone dates', () => {
            const original = new Date('2023-10-15');
            const cloned = Utils.deepClone(original);

            expect(cloned).not.toBe(original);
            expect(cloned).toEqual(original);
            expect(cloned instanceof Date).toBe(true);
        });
    });
});