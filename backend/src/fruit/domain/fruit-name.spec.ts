import { FruitName } from './fruit-name';

describe('FruitName', () => {
    it('removes leading and trailing whitespace from names', async () => {
        const nameWithWhitespace = '  Apple  ';
        const trimmedName = FruitName.create(nameWithWhitespace);
        expect(trimmedName.displayName).toBe('Apple');
    });
    it('compares names with the same text by value', () => {
        const first = FruitName.create('Banana');
        const second = FruitName.create('BanAna');

        expect(first.normalizedName).toBe(second.normalizedName);
    });
    it('rejects empty names', async () => {
        const emptyName = '';
        expect(() => FruitName.create(emptyName)).toThrow('Name cannot be empty');
    });
    it('rejects names with only whitespace', async () => {
        const whitespaceName = '   ';
        expect(() => FruitName.create(whitespaceName)).toThrow('Name cannot be empty');
    });
    it('displays the name value correctly', async () => {
        const name = FruitName.create('Cherry');
        expect(name.displayName).toBe('Cherry');
        expect(name.normalizedName).toBe('cherry');
    });
});