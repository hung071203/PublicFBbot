// Import the GoogleAIFileManager from the Google Generative AI library.
// For versions lower than @google/generative-ai@0.13.0, use "@google/generative-ai/files"
const mime = require('mime-types');
const {
  GoogleAIFileManager,
  FileState,
} = require("@google/generative-ai/server");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Load environment variables from a .env file
require("dotenv").config();

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.APIG);

// Define an async function to handle the file upload.
async function uploadFile(filePath, fileName) {
  try {
    const format = mime.lookup(filePath);
    if (!format)
      return {
        success: false,
        error: "Định dạng File không hợp lệ!, file tên " + fileName,
      };
    // Upload the file and specify a display name.
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: format,
      displayName: fileName,
    });
    const name = uploadResponse.file.name;

    // Poll getFile() on a set interval (10 seconds here) to check file state.
    let file = await fileManager.getFile(name);
    while (file.state === FileState.PROCESSING) {
      process.stdout.write(".");
      // Sleep for 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      // Fetch the file from the API again
      file = await fileManager.getFile(name);
    }

    if (file.state === FileState.FAILED) {
      return {
        success: false,
        error: "Upload lỗi!",
      };
    }
    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );
    return uploadResponse;
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

const genAI = new GoogleGenerativeAI(process.env.APIG);

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-exp-0827",
  safetySettings,
  tools: [
    {
      codeExecution: {},
    },
  ],
});
async function chat({ content, his, filePath }) {
  try {
    const chat = model.startChat({
      generationConfig,
      history: his,
    });
    let paths;
    if(filePath?.length == 1) {
      paths = [{fileData: {mimeType: filePath[0].file.mimeType, fileUri: filePath[0].file.uri}}, {text: content}];
    }else if(filePath?.length > 1) {
      [{ text: prompt }, ...filePath.map((file) => ({ fileData: { mimeType: file.mimeType, fileUri: file.uri } }))];
    }else{
      paths = [{text: content}];
    }
    
    const result = await chat.sendMessage(paths);
    return {
      text: result.response.text(),
      his: his,
    };
  } catch (error) {
    console.error(error);
    return {
      text: error.message,
      his: his,
    };
  }
}

module.exports = { uploadFile, chat};
