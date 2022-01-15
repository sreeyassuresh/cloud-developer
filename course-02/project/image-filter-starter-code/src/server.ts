import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get( "/filteredimage/", async ( req, res ) => {
    const image_url = req.query.image_url;
    try {
        if (image_url === null) {
            return res.status(500).send({ message: 'image url not found' });
        } 
        else {
           const filePath = await filterImageFromURL(image_url);
          
          await res.status(201).sendFile(filePath, {}, (error) => {
            if(error) { return res.status(422).send({message :`Unable to process the image`}); }
            deleteLocalFiles([filePath]);
          });
        }
    }
    catch(err) {
      res.status(500).send('Error Occurred in Image Filtering Service. Try with another image URL');
    }
   
  } );

  

  

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {   
    res.send("try GET /filteredimage?image_url={{}}")   
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();