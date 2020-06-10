const express = require('express')
const expressGraphql = require('express-graphql')
const mysql=require('mysql')
const util=require('util')
const {
    GraphQLSchema,
    GraphQLList,
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString
} = require('graphql')

const conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'itvlog'
})
const query=util.promisify(conn.query).bind(conn)

const app = express();
const StudentType = new GraphQLObjectType({
    name: 'Student',
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        sex: { type: GraphQLString }
    }
})
const Query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        student: {
            type: StudentType,
            args: {
                id: { type: GraphQLInt }
            },
            async resolve(_, { id }) {
                //return { id: id, name: 'itvlog', age: 21, sex: 'male' }
                let res=await query(`select * from student where id=${id}`)
                return res[0]
            }
        },
        students: {
            type: new GraphQLList(StudentType),
            async resolve(_,{ }) {
                //return { id: id, name: 'itvlog', age: 21, sex: 'male' }
                let res=await query(`select * from student`)
                return res;
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'mutation',
    fields: {
        insertStudent: {
            type: StudentType,
            args: {
                name: { type: GraphQLString },
                age: { type: GraphQLInt },
                sex: { type: GraphQLString },
            },
            async resolve(_, { name,age,sex }) {
               let res=await query(`insert into student(name,age,sex)values('${name}',${age},'${sex}')`)
                return {id:res.insertId,name,age,sex}
            }
        }
    }
});

let schema = new GraphQLSchema({
    query: Query,
    mutation:mutation
})
app.use('/student', expressGraphql({
    graphiql: true,
    schema: schema
}))
app.listen(3000)