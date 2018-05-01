const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const {
    connectionArgs,
    connectionDefinitions,
    connectionFromArray,
    fromGlobalId,
    globalIdField,
    nodeDefinitions,
    toGlobalId,
    mutationWithClientMutationId
} = require('graphql-relay');

const Post = require('../models/post');

class User {}
const viewer = new User();
viewer.id = '1';
viewer.name = 'me';

function getPost(id) {
    return Post.findById(id);
}

function CreatePost(description, imageUrl) {
    return (new Post({ description, imageUrl })).save();
}

function DeletePost(globalId) {
    const {type, id} = fromGlobalId(globalId);
    return new Promise((resolve, reject) => {
        Post.findByIdAndRemove(id, (error, deletedPost) => {
            if(deletedPost) {
                resolve(deletedPost)
            }
            resolve(null)
        })
    })
}

const {nodeInterface, nodeField} = nodeDefinitions(
    (globalId) => {
        const {type, id} = fromGlobalId(globalId);
        if (type === 'Post') {
            return getPost(id);
        }
        return null
    },
    (obj) => {
        return obj.imageUrl ? PostType : null
    }
);

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: globalIdField(),
        description: { type:GraphQLString },
        imageUrl: { type:GraphQLString }
    }),
    interfaces: [nodeInterface],
});

const { connectionType: postConnection } = 
    connectionDefinitions({ name: 'Post', nodeType: PostType });

const ViewerType = new GraphQLObjectType({
    name: 'Viewer',
    fields: () => ({
        id: globalIdField(),
        allPosts: {
            type: postConnection,
            args: connectionArgs,
            resolve: async (parentValue, args) => {
                let posts = await Post.find({});
                return connectionFromArray(posts, args)
            }
        }
    }),
    interfaces: [nodeInterface],
});

const createPostMutation = mutationWithClientMutationId({
    name: 'CreatePost',
    inputFields: {
      description: {
        type: new GraphQLNonNull(GraphQLString)
      },
      imageUrl: {
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    outputFields: {
      post: {
        type: PostType,
        resolve: payload => getPost(payload.id)
      }
    },
    mutateAndGetPayload: ({ description, imageUrl }) => {
      const newPost = CreatePost(description, imageUrl);
      return {
        id: newPost.id
      };
    }
});

const deletePostMutation = mutationWithClientMutationId({
    name: 'DeletePost',
    inputFields: {
      id: {
        type: new GraphQLNonNull(GraphQLID)
      }
    },
    outputFields: {
        deletedId: {
        type: GraphQLID,
        resolve: (payload) => {
            return toGlobalId('Post', payload.id)
        }
      }
    },
    mutateAndGetPayload: async ({ id }) => {
        return await DeletePost(id);
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createPost: createPostMutation,
        deletePost: deletePostMutation
    })
});

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        node: nodeField,
        viewer: {
            type: ViewerType,
            resolve: () => viewer,
        },
    })
});


module.exports = new GraphQLSchema({
    query: Query,
    mutation: Mutation
});