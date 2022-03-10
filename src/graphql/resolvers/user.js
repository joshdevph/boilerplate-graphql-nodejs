import { UserInputError } from 'apollo-server';
import { Op, or } from 'sequelize';
import { isAuthenticated, isSessionAuthenticated } from './authorization';
import { combineResolvers } from 'graphql-resolvers';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const NEW_USER_ADDED = "NEW_USER_ADDED";
export default {
    Subscription: {
        newRegistration: {
            subscribe: (parent, args, { session }) => pubsub.asyncIterator([NEW_USER_ADDED]),
        },
    },
    Query: {
        // ! This query is for the logged in user
        isLoggedIn: async(root, args, { session }, info) => {
            return isSessionAuthenticated(session);
        },
        me: combineResolvers(
            isAuthenticated,
            async(root, args, { db, me }, info) => {
                const user = await db.user.findByPk(me.id);
                return user;
            }
        ),
        // ! This query grabs all the users
        users: combineResolvers(
            isAuthenticated,
            async(root, args, { db }, info) => {
                const users = await db.user.findAll();
                if (!users) {
                    throw new Error('No users found');
                }
                return users;
            }
        ),
        // ! This query grabs all the users under the admin
        alladminuser: async(root, args, { db, session }, info) => {
            if (session.user && session.user.role == "admin") {
                if (session.user.id) {
                    const users = await db.user.findAll({
                        where: {
                            userid: session.user.id
                        }
                    });
                    if (!users) {
                        throw new Error('No users found');
                    }
                    return users;
                }
            } else {
                throw new Error('No session found');
            }
        },
        // ! This query grabs all the franchiseuser under the franchiser
        allFranchiseUserOrFranchiser: async(root, { id }, { db }, info) => {
            let users;
            if(id == 0){
                users = await db.user.findAll({
                    where: {
                        role: 'franchiser'
                    }
                });
            }else{
                users = await db.user.findAll({
                    where: {
                        userid: id
                    }
                });
            }

            if (!users) {
                throw new Error('No users found');
            }
            return users;
        },
        // ! This query grabs specific franchise details
        franchiseeProfile: async(root, { id }, { db }, info) => {
            const users = await db.user.findOne({
                where: {
                    id: id,
                    role: "franchiser"
                }
            });
            if (!users) {
                throw new Error('No users found');
            }
            return users;
        },
        franchiseCount:  async (root, args, {db},) => {
            let franchiseCount;
            franchiseCount = await db.user.count({
                where: {
                    role:{
                        [Op.or]:['adminuser', 'admin']
                    }
                }
            });
            return franchiseCount
        },
        adminCount:  async (root, args, {db},) => {
            let adminCount;
            adminCount = await db.user.count({
                where: {
                    role:{
                        [Op.or]:['adminuser', 'admin']
                    }
                }
            });
            return adminCount
        },
        kitchenOwnerCount:  async (root, args, {db},) => {
            let kitchenownerCount;
            kitchenownerCount = await db.user.count({
                where: {
                    role: 'kitchenowner'
                }
            });
            return kitchenownerCount
        },
        allKitchenOwnerPerFranchise: async(root, { id }, { db }, info) => {
            let users;
            if(id == 0){
                users = await db.user.findAll({
                    where: {
                        role: 'kitchenowner'
                    }
                });
            }else{
                users = await db.user.findAll({
                    where: {
                        userid: id
                    }
                });
            }

            if (!users) {
                throw new Error('No users found');
            }
            return users;
        },
        kitchenOwnerProfile: async(root, { id }, { db }, info) => {
            const users = await db.user.findOne({
                where: {
                    [Op.and]: [
                        {id : id},
                        {role: "kitchenowner"}
                    ]
                }
            });
            if (!users) {
                throw new Error('No users found');
            }
            return users;
        },
        franchiseUserProfile: async(root, { id }, { db }, info) => {
            const users = await db.user.findOne({
                where: {
                        id : id,
                        role: "franchiseuser"
                }
            });
            if (!users) {
                throw new Error('No users found');
            }
            return users;
        },

    },
    Mutation: {
        // ! This mutation creates new user
        createUser: async(root, { input }, { db, session }) => {
            const { username, email } = input;
            const userExists = await db.user.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });
            if (userExists) {
                throw new Error('A user with this email or username already exists');
            }
            if (session.user) {
                if (session.user.role == "admin") {
                    input.role = 'adminuser'
                    input.userid = session.user.id
                }
            }
            const user = await db.user.create({
                ...input,
            });
            pubsub.publish(NEW_USER_ADDED, {
                newRegistration: user
            })
            return user;
        },
        login: async(root, { username, password }, { db, session }, info) => {
            const user = await db.user.findOne({
                where: { username },
            });
            if (!user) {
                throw new UserInputError(`User with ${username} does not exist`);
            }

            const isValid = await user.validatePassword(password);
            if (!isValid) {
                throw new UserInputError('Password is invalid');
            }

            session.user = {
                id: user.dataValues.id,
                username: user.dataValues.username,
                email: user.dataValues.email,
                role: user.dataValues.role
            };

            return user;
        },
        logout: async(root, args, { session, res }, info) => {
            let loggedOutUser = session.user;
            await session.destroy();
            res.clearCookie(process.env.SESSION_NAME);
            return loggedOutUser;
        },
        // ! This mutation creates new franchiser
        createFranchiser: async(root, { input }, { db, session }) => {
            const { username, email } = input;
            const userExists = await db.user.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });
            if (userExists) {
                throw new Error('A user with this email or username already exists');
            }
            if (session.user) {
                input.userid = session.user.id
                if (session.user.role === "admin" || session.user.role === "superadmin") {
                    input.role = 'franchiser'
                } else if (session.user.role === "franchiser") {
                    input.role = 'franchiseuser'
                } else {
                    throw new UserInputError('Your Role is not allowed to Create Franchiser');
                }
            } else {
                throw new UserInputError('Unauthorized User');
            }
            const user = await db.user.create({
                ...input,
            });
            pubsub.publish(NEW_USER_ADDED, {
                newRegistration: user
            })
            return user;
        },
        createKitchenOwner: async(root, { input }, { db, session }) => {
            const { username, email } = input;
            const userExists = await db.user.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });
            if (userExists) {
                throw new Error('A user with this email or username already exists');
            }
            if (session.user) {
                if(session.user.role === "admin" || session.user.role === "adminuser"){
                    if(!input.userid){
                        throw new UserInputError('Please provide a Franchisee');
                    }
                }else{
                    input.userid = session.user.id
                }
                if (session.user.role === "admin" || session.user.role === "adminuser" || session.user.role === "franchiser") {
                    input.role = 'kitchenowner'
                } else {
                    throw new UserInputError('Your Role is not allowed to Create Franchiser');
                }
            } else {
                throw new UserInputError('Unauthorized User');
            }
            const user = await db.user.create({
                ...input,
            });
            pubsub.publish(NEW_USER_ADDED, {
                newRegistration: user
            })
            return user;
        },
        updateUser: async(root, { id, input }, { db, session }) => {
            const user = await db.user.findOne({
                where: { id },
            });
            input.password = await user.updatePasswordHash(input.password)
            const users = await db.user.update({
                ...input,
            },{
                where:{
                    id: id
                }
            });
            return !!users
        },
    }
};