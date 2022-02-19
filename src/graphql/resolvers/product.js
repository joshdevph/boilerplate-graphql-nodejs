
export default {
    Mutation: {
        createProduct: async (_, { input }, {db, session}) => {
            let product;
            if(session.user){
                input.userid=session.user.id
                product = await db.product.create({
                    ...input
                })
            }
            return product;
        },
    },
    Query: {
      
    }
};