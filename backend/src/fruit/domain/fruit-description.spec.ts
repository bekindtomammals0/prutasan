import { FruitDescription } from './fruit-description';

describe('FruitDescription', () => {
  it('rejects descriptions longer than 30 characters', async () => {
    const longDescription = 'This description is definitely longer than thirty characters.';
    expect(() => FruitDescription.create(longDescription)).toThrow(
      'Description must be 30 characters or less',
    );
  });
  it('accepts descriptions of 30 characters or less', async () => {
    const validDescription = '30 characters including space.';
    expect(() => FruitDescription.create(validDescription)).not.toThrow();
  });
  it('accepts normal description', async () => {
    const validDescription = 'A normal fruit description.';
    expect(() => FruitDescription.create(validDescription)).not.toThrow();
  });
  it('rejects empty description', async () => {
    const emptyDescription = '';
    expect(() => FruitDescription.create(emptyDescription)).toThrow('Description cannot be empty');
  });
  it('rejects description with only whitespace', async () => {
    const whitespaceDescription = '   ';
    expect(() => FruitDescription.create(whitespaceDescription)).toThrow(
      'Description cannot be empty',
    );
  });
  it('compares descriptions with the same text by value', () => {
    const first = FruitDescription.create('A citrus fruit');
    const second = FruitDescription.create('A citrus fruit');

    expect(first.equals(second)).toBe(true);
  });
});
