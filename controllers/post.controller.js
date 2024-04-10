import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

/*export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};*/

export const getPost = async (req, res) => {
  const id = req.params.id;
 
  try {
     const post = await prisma.post.findUnique({
       where: { id },
       include: {
         postDetail: true,
         user: {
           select: {
             username: true,
             avatar: true,
           },
         },
       },
     });
 
     const token = req.cookies?.token;
     let isSaved = false;
 
     if (token) {
       // Wrap jwt.verify in a promise to use with async/await
       const payload = await new Promise((resolve, reject) => {
         jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
           if (err) {
             reject(err); // Reject the promise if there's an error
           } else {
             resolve(decoded); // Resolve the promise with the decoded payload
           }
         });
       }).catch(err => {
         console.log('JWT verification error:', err);
         // Handle the error as needed, e.g., by sending an error response
         // or by setting isSaved to false and continuing
       });
 
       if (payload) {
         const saved = await prisma.savedPost.findUnique({
           where: {
             userId_postId: {
               postId: id,
               userId: payload.id,
             },
           },
         });
         isSaved = saved ? true : false;
       }
     }
 
     // Send the response only once, after all asynchronous operations have completed
     res.status(200).json({ ...post, isSaved });
  } catch (err) {
     console.log(err);
     res.status(500).json({ message: "Failed to get post" });
  }
 };
 

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};