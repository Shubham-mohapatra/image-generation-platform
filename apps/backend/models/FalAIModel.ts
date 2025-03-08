import { BaseModel } from "./BaseModel";
import { fal } from "@fal-ai/client";
export class FalAIModel extends BaseModel {
    constructor() {
        super();
    }
    private async generateImage(prompt:string){

            const {request_id  , response_url} = await fal.queue.submit("fal-ai/flux-realism", {
                input: {
                    prompt: prompt,
                },
                webhookUrl  : `${process.env.WEBHOOK_BASE_URL}/fal-ai/webhook/image`
          
            });
            return {request_id , response_url};
        
    }
    private async trainModel(zipUrl : string , triggerWord:string){

        const { request_id , response_url} = await fal.queue.submit("fal-ai/flux-realism", {
            input: {
              images_data_url:"zipurl",
              trigger_word  :triggerWord
            },
            webhookUrl: `${process.env.WEBHOOK_BASE_URL}/fal-ai/webhook/train`,
          });
          return {request_id ,  response_url}
    }
  
    // Public methods to expose the private methods
    public async generateImagePublic(prompt: string) {
        return this.generateImage(prompt);
    }
    
    public async trainModelPublic(zipUrl: string, triggerWord: string) {
        return this.trainModel(zipUrl, triggerWord);
    }
}