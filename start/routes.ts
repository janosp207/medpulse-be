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

//syncing routes
Route.get('/api/sync/activity/:id', 'WithingsController.syncActivity')

//manual blood info logs
Route.post('/api/patients/:id/bloodpressure', 'PatientsBloodPressuresController.store')
Route.post('/api/patients/:id/bloodoxygen', 'PatientsBloodOxygensController.store')

//Patients

//doctors
Route.get('/api/patients/:doctorId', 'PatientsController.index')
Route.get('/api/patients/:id/latestdata', 'PatientsController.getLatestData')
Route.get('/api/patients/show/:id', 'PatientsController.show')
Route.get('/api/patients/:id/limitvalues', 'PatientsLimitsController.index')
Route.post('/api/patients/:id/limitvalues', 'PatientsLimitsController.store')
Route.get('/api/patients/:id/warnings', 'PatientsController.warnings')
Route.get('/api/patients/:id/activity', 'PatientsController.activity')

Route.get('/api/patients/:id/measurements/:type', 'PatientsMeasurementsController.index')
Route.get('/api/patients/:id/sleep', 'PatientsSleepController.index')
Route.get('/api/patients/:id/sleep/:sleepId', 'PatientsSleepController.show')

Route.get('/api/patients/:id/bloodpressure', 'PatientsBloodPressuresController.index')
Route.get('/api/patients/:id/bloodoxygen', 'PatientsBloodOxygensController.index')
Route.get('/api/patients/:id/wellness', 'PatientWellnessRatingsController.index')

//login
Route.post('/api/doctors/login', 'DoctorsController.login')
