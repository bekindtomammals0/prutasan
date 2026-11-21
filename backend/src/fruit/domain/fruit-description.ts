export class FruitDescription{
    private constructor(public readonly value:string){

    }

    static create(rawDescription:string):FruitDescription{
        if(!rawDescription || rawDescription.trim().length === 0){
            throw new Error('Description cannot be empty');
        }
        else if(rawDescription.trim().length > 30){
            throw new Error('Description must be 30 characters or less');
        }
        else{
            return new FruitDescription(rawDescription.trim());
        }
    }
    equals(other: FruitDescription): boolean {
        return this.value === other.value;
    }
}