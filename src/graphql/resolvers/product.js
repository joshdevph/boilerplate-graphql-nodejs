
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
        updateProduct: async (_, { input }, {db, session}) => {
            let product;
            if(session.user){
                input.userid=session.user.id
                product = await db.product.update(
                    {...input},
                    {where: {id : input.productid}}
                )
            }
            return !!product;
        },
        deleteProduct: async (_, { productid }, {db, session}) => {
            let product;
            if(session.user){
                product = await db.product.destroy(
                    {where: {id : productid}}
                )
            }
            return !!product;
        },
    },
    Query: {
        getAllProduct: async (_, __, {db, session}) => {
            let product;
            if(session.user){
                    product = await db.product.findAll(
                        {raw: true}
                    )
            }
            return product;
        },
        getProduct: async (_, { productid }, {db, session}) => {
            let product;
            if(session.user){
                if(!productid){
                    throw new Error('Please pass a Product ID');
                }
                product = await db.product.findOne(
                    {raw: true},
                    {where: {id : productid}}
                )
            }
            return product;
        },
        getAllProductsCount: async (_, __, {db, session}) => {
            let product;
            if(session.user){
                product = await db.product.count()
            }
            return product;
        },
    }
};