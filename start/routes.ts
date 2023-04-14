/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/api/storeAccessToken', 'WithingsController.storeAccessTokenByUserId')
Route.get('/callback', 'WithingsController.callback')
Route.get('/api/measure', 'WithingsController.getMeasurements')

//syncing routes
Route.get('/api/sync/activity', 'WithingsController.syncActivity')

//manual blood info logs
Route.post('/api/bloodpressure', 'PatientsBloodPressuresController.store')
Route.post('/api/bloodoxygen', 'PatientsBloodOxygensController.store')

//get latest data
Route.get('/api/latestdata', 'PatientsController.getLatestData')

//doctors
Route.post('/api/doctor/patients', 'PatientsController.store')
