// imports here for express and pg
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db');
const express = require('express');
const app = express();
const path = require('path');

app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets')));
// static routes here (you only need these for deployment)
app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));

// app routes here
app.get('/api/notes', async(req, res, next)=> {
    try {
        const SQL = `
            SELECT *
            FROM notes
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    }
    catch(ex){
        next(ex);
    }
});

// create your init function

// init function invocation
const init = async()=> {
    console.log('connecting to database');
    
    await client.connect();
    
    console.log('connected to database');
    
    let SQL = `
    DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
        id SERIAL PRIMARY KEY,
        txt VARCHAR(255),
        starred BOOLEAN DEFAULT false
    );
    `;
    await client.query(SQL);
    
    console.log('tables created');
    
    SQL = `
        INSERT INTO notes(txt) VALUES('learn express');
        INSERT INTO notes(txt, starred) VALUES('write sql queries', true);
        INSERT INTO notes(txt, starred) VALUES('create express routes', false);
    `;
    await client.query(SQL);
    console.log('data seeded');
    
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log(`curl localhost:${port}/api/notes`);
    });
    
}

init();
