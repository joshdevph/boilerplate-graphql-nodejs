
export default {
    Mutation: {
        createCategory: async (_, { description }, {db, session}) => {
            let category
            if(session.user){
                category = await db.category.create({
                    description : description
                })
            }
            if(!category){
                throw new Error('Error while saving Category');
            }
            return !!category;
        },

        deleteCategory: async (_, { description_id }, {db, session}) => {
            let category
            if(session.user){
                category = await db.category.destroy({
                    where: {
                        id : description_id
                    }
                })
            }
            if(!category){
                throw new Error('Error while deleting Category');
            }
            return !!category;
        },
        updateCategory: async (_, { description,description_id }, {db, session}) => {
            let category
            if(session.user){
                await db.category.findOne({
                    where: {
                        id : description_id
                    }
                }).then(data => {
                    category = data.update({
                        description : description
                    })
                })
            }else{
                throw new Error('No Authentication Found');
            }
            if(!category){
                throw new Error('Error while updating Category');
            }
            return !!category;
        },
    },
    Query: {
        getAllCategory: async (_, __, {db, session}) => {
            let category
            if(session.user){
                category = await db.category.findAll({
                    raw : true
                })
            }
            if(!category){
                throw new Error('Error while deleting Category');
            }
            return category;
        },
    }
};