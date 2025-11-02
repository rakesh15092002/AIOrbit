import sql from "../configs/db.js"

export const getUserCreations = async (req,res)=>{
    try {
        const {userId}=req.auth()
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        req.json({success:true,message:creations});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getPublishCreations = async (req,res)=>{
    try {
        const creations = await sql`
        SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        req.json({success:true,message:creations});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const toggleLikeCreation = async (req,res)=>{
    try {
        const {userId}=req.auth()
        const {id} = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`
       
        if(!creation){
            return res.json({success:false,message:"Creation not found"})
        }
        
        const currentLike = creation.likes;
        const userIdStr = userId.toSting();
        let updatedLikes;
        let message;

        if(currentLike.includes(userId)){
            updatedLikes = currentLike.filter((user)=>user !==userIdStr);
            message = "Creation Unliked"
        }
        else{
            updatedLikes = [...currentLike,userIdStr]
            message = 'Creation Liked'
        }
        const formattedArray = `{${updatedLikes.json(',')}}`
        
        await sql`UPDATE creations SET likes= ${formattedArray}::text[] WHERE id = ${id}`;
        res.json({success:true,message})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

