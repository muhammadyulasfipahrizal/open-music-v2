const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');
// album import
const album = require('./api/album');
const AlbumValidator = require('./validator/album');
const AlbumService = require('./services/inMemory/AlbumService');
// songs import
const songs = require('./api/song');
const SongsService = require('./services/inMemory/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const albumService = new AlbumService();
  const songsService = new SongsService();
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    }, {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
