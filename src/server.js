require("dotenv").config();
import express from "express";
import { ApolloServer } from "apollo-server-express";
import db from "./db";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import http from "http";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";

// ! initialize sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// ! Declare express application
const app = express();

// ! Middleware express
app.use(cookieParser());
app.use(
    session({
        name: process.env.SESSION_NAME,
        secret: process.env.APP_SECRET,
        store: new SequelizeStore({
            db: db.sequelize,
        }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV == "production",
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
        },
    })
);

app.use(
    cors({
        origin: ["http://localhost:4040"],
        credentials: true,
    })
);

// ! Apollo server creation
const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    cors: true,
    context: async({ req, res, connection }) => {
        if (req) {
            return {
                db,
                res,
                session: req.session,
                me: req.session,
                secret: process.env.APP_SECRET,
            };
        }
    },
});

server.applyMiddleware({ app, path: "/graphql", cors: false });

const httpServer = http.createServer(app);

db.sequelize.sync().then(async() => {
    console.log(`Done Task ------> Database update to latest!`);
});
httpServer.listen({ port: process.env.PORT }, () => {
    console.log(
        `Apollo server ready at http://localhost:${process.env.PORT}/graphql`
    );
});