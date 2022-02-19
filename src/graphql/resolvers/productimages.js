const cloudinary = require("cloudinary");
export default {
    Mutation: {
        uploadPhoto: async (_, { photo }) => {
            let result;
            //initialize cloudinary
            cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            try {
                result= await cloudinary.v2.uploader.upload(photo, {
                allowed_formats: ["jpg", "png"],
                public_id: "",
                folder: "pasabayapp_photo",
            });
            } catch (e) {
            return `Image could not be uploaded:${e.message}`;
            }
            return result.url;
        },
    },
    Query: {
        getAllPhoto: async(_, __,) => {
            var resultTemp = [];
            var options = { resource_type:"image", folder:"pasabayapp_photo", max_results: 500};
            cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            const result =await cloudinary.api.resources(options);
            const data = result.resources
            for(var res in data) {
                let folder = data[res].public_id.split('/')[0]
                    if(folder === "pasabayapp_photo"){
                        resultTemp.push({
                            asset_id: data[res].public_id,
                            url: data[res].url
                        })
                    }
                }
            return resultTemp;
        },
        getPhoto: async(_, {img_id},) => {
            cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            const result =await cloudinary.v2.image(
                `https://res.cloudinary.com/dfvl0fq9e/image/upload/pasabayapp_photo/${img_id}.jpg`
                );
            return result;
        }
    }
};