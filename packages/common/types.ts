import { z } from "zod";

// Define a type for the model's name
const Name = z.string();

// Define a type for the model's type
const Type = z.enum(["Man", "Women", "Dog", "Cat", "Others"]);

// Define a type for the model's age
const Age = z.number();

// Define a type for the model's gender
const Gender = z.enum(["Male", "Female", "Non-Binary", "Other"]);

// Define a type for the model's address
const Address = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string(),
});

// Define a type for the model's contact information
const ContactInfo = z.object({
    email: z.string().email(),
    phone: z.string().optional(),
});

// Define a type for the model's ethnicity
const Ethnicity = z.enum(["Indian", "MiddleEastern", "Asian", "Black", "Hispanic", "White", "Other"]);

// Define a type for the model's eye color
const EyeColor = z.enum(["Black", "Brown", "Blue", "Green","Grey"]);

const Bald = z.boolean();

const Images = z.array(z.string())

// Define the main TrainModel type using the above types
const TrainModel = z.object({
    name: Name,
    type: Type,
    age: Age,
    gender: Gender.optional(),
    address: Address.optional(),
    contactInfo: ContactInfo.optional(),
    ethnicity: Ethnicity,
    eyecolor: EyeColor, 
    bald: Bald,
    images : Images.optional()

});

export { TrainModel, Name, Type, Age, Gender, Address, ContactInfo, Ethnicity, EyeColor, Bald,Images};

export const GenerateImage = z.object({
    prompt: z.string(),
    modelID : z.string(),
    num : z.number()
});

export const GenerateImagesFromPack = z.object({
    modelID : z.string(),
    packID  : z.string()
})