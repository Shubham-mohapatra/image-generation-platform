import express from "express";
import type { Request, Response } from "express";
import { TrainModel, GenerateImage, GenerateImagesFromPack } from "../../packages/common/types";
import { prismaClient } from "../../packages/db";
import { s3, write, S3Client } from "bun";
import { FalAIModel } from "./models/FalAIModel";

console.log(process.env.FAL_KEY);

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8080;
const USER_ID = "123";
app.use(express.json({ limit: '10mb' }));

// Define a route for the root URL
router.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the API!"); // Custom message for the root URL
});

// endpoints 
const falAIModel = new FalAIModel(); // Create an instance

// Training endpoint
router.post("/ai/training", async (req: Request, res: Response) => {
    const parsedBody = TrainModel.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(411).json({ message: "Input Incorrect" });
    }

    try {
        const { request_id } = await falAIModel.trainModelPublic("", parsedBody.data.name);

        const data = await prismaClient.model.create({
            data: {
                name: parsedBody.data.name,
                type: parsedBody.data.type,
                age: parsedBody.data.age,
                ethnicity: parsedBody.data.ethnicity,
                eyecolor: parsedBody.data.eyecolor,
                bald: parsedBody.data.bald,
                userId: USER_ID,
                falAiRequestId: request_id
            }
        });

        res.json({
            id: data.id,
            request_id
        });
    } catch (error) {
        console.error("Error in training model:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Generate from model endpoint
router.post("/ai/generate-from-model", async (req: Request, res: Response) => {
    const parsedBody = GenerateImage.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(411).json({ message: "Input Incorrect" });
    }

    try {
        const model = await prismaClient.model.findUnique({
            where: {
                id: parsedBody.data.modelID
            }
        });

        if (!model) {
            return res.status(404).json({ message: "Model not found" });
        }

        const { request_id } = await falAIModel.generateImagePublic(parsedBody.data.prompt);

        const data = await prismaClient.outputImage.create({
            data: {
                prompt: parsedBody.data.prompt,
                modelId: parsedBody.data.modelID,
                userId: USER_ID,
                imageUrl: "",
                falAiRequestId: request_id
            }
        });

        res.json({
            id: data.id,
            request_id
        });
    } catch (error) {
        console.error("Error in generating image:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Generate endpoint
router.post("/ai/generate", async (req: Request, res: Response) => {
    const parsedBody = GenerateImage.safeParse(req.body);
    
    if (!parsedBody.success) {
        return res.status(411).json({ message: "Input Incorrect" });
    }

    try {
        const { request_id } = await falAIModel.generateImagePublic(parsedBody.data.prompt);

        const data = await prismaClient.outputImage.create({
            data: {
                prompt: parsedBody.data.prompt,
                modelId: parsedBody.data.modelID,
                userId: USER_ID,
                imageUrl: "",
                falAiRequestId: request_id
            }
        });

        res.json({
            id: data.id,
            request_id
        });
    } catch (error) {
        console.error("Error in generating image:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Pack generate endpoint
router.post("/pack/generate", async (req: Request, res: Response) => {
    const parsedBody = GenerateImagesFromPack.safeParse(req.body);

    if (!parsedBody.success) {
        return res.status(411).json({
            message: "Input incorrect"
        });
    }

    try {
        const prompts = await prismaClient.packPrompts.findMany({
            where: {
                packId: parsedBody.data.packID
            }
        });
        
        const images = await prismaClient.outputImage.createMany({
            data: prompts.map((prompt) => ({
                prompt: prompt.prompt,
                userId: USER_ID,
                modelId: parsedBody.data.modelID,
                imageUrl: "",
            })),
        });

        // If you need to return the created images, you will have to fetch them separately
        const createdImages = await prismaClient.outputImage.findMany({
            where: {
                userId: USER_ID,
                modelId: parsedBody.data.modelID,
                // Add any other filters if necessary
            }
        });

        res.json({
            images: createdImages.map((image) => image.id)
        });
    } catch (error) {
        console.error("Error in generating pack images:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Pack bulk endpoint
router.post("/pack/bulk", async (req: Request, res: Response) => {
    try {
        const packs = await prismaClient.packs.findMany({});
        res.json({
            packs
        });
    } catch (error) {
        console.error("Error fetching packs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Image bulk endpoint
router.get("/image/bulk", async (req: Request, res: Response) => {
    try {
        const ids = req.query.images as string[];
        const limit = req.query.limit as string ?? "10";
        const offset = req.query.offset as string ?? "0";

        const imagesData = await prismaClient.outputImage.findMany({
            where: {
                id: { in: ids },
                userId: USER_ID // the user cannot see other users' photos 
            },
            skip: parseInt(offset),
            take: parseInt(limit)
        });
        
        res.json({
            images: imagesData
        });
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Webhook for training
router.post("/fal-ai/webhook/train", async (req: Request, res: Response) => {
    try {
        console.log(req.body);

        const requestId = req.body.request_id;
        await prismaClient.model.updateMany({
            where: { 
                falAiRequestId: requestId
            },
            data: {
                trainingStatus: "Generated",
            }
        });
        
        // update the status of the image in the db 
        res.json({
            message: "Webhook received"
        });
    } catch (error) {
        console.error("Error in training webhook:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Webhook for image generation
router.post("/fal-ai/webhook/image", async (req: Request, res: Response) => {
    try {
        console.log(req.body);

        const requestId = req.body.request_id;

        await prismaClient.outputImage.updateMany({
            where: { 
                falAiRequestId: requestId
            },
            data: {
                status: "Generated",
                imageUrl: req.body.image_url
            }
        });

        res.json({
            message: "Webhook received"
        });
    } catch (error) {
        console.error("Error in image webhook:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Use the router
app.use(router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
 