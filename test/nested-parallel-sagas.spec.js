// This example shows how to run multiple nested sagas, all in parallel.
//
// rootSaga => sagaA => sagaA1
//                   => sagaA2
//          => sagaB => sagaB1
//                   => sagaB2

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { delay } from 'redux-saga'
import { all, call, put } from 'redux-saga/effects'

import { expect } from 'chai'

const started = label => ({ type: 'STARTED', label })
const stopped = label => ({ type: 'STOPPED', label })

function* sagaA1() {
  yield put(started('a1'))
  yield delay(100)
  yield put(stopped('a1'))
}

function* sagaA2() {
  yield put(started('a2'))
  yield delay(100)
  yield put(stopped('a2'))
}

function* sagaA() {
  yield all([
    call(sagaA1),
    call(sagaA2),
  ])
}

function* sagaB1() {
  yield put(started('b1'))
  yield delay(100)
  yield put(stopped('b1'))
}

function* sagaB2() {
  yield put(started('b2'))
  yield delay(100)
  yield put(stopped('b2'))
}

function* sagaB() {
  yield all([
    call(sagaB1),
    call(sagaB2),
  ])
}

function* rootSaga() {
  yield all([
    call(sagaA),
    call(sagaB),
  ])
}

////////////////////////////////////////////////////////////////////////////////

function setup() {
  // store the dispatched actions
  const dispatched = []
  // set up mock environment
  const middleware = createSagaMiddleware()
  const reducer = (_, action) => {
    dispatched.push(action)
    return {}
  }
  const store = applyMiddleware(middleware)(createStore)(reducer)
  // clear dispatched to get rid of the redux init action
  dispatched.length = 0
  return { dispatched, middleware, store }
}

////////////////////////////////////////////////////////////////////////////////

describe('sagaA1', function() {
  it('immediately dispatches a STARTED action', function() {
    let { dispatched, middleware } = setup()
    let task = middleware.run(sagaA1)
    return Promise.resolve()
      .then(() => {
        expect(dispatched).to.deep.equal([
          { type: 'STARTED', label: 'a1' },
        ])
      })
  })

  it('dispatches a STOPPED action after some time', function() {
    let { dispatched, middleware } = setup()
    let task = middleware.run(sagaA1)
    return Promise.resolve(null)
      .then(() => new Promise((resolve) => { setTimeout(resolve, 110) }))
      .then(() => {
        expect(dispatched).to.deep.equal([
          { type: 'STARTED', label: 'a1' },
          { type: 'STOPPED', label: 'a1' },
        ])
      })
  })
})

describe('sagaA', function() {
  beforeEach(function() {
    let { dispatched, middleware } = setup()
    let task = middleware.run(sagaA)
    this.dispatched = dispatched
  })

  it('immediately dispatches two STARTED actions', function() {
    return Promise.resolve()
      .then(() => {
        expect(this.dispatched).to.deep.equal([
          { type: 'STARTED', label: 'a1'},
          { type: 'STARTED', label: 'a2'},
        ])
      })
  })

  it('dispatches two STOPPED actions after some time', function() {
    return Promise.resolve()
      .then(() => new Promise((resolve) => { setTimeout(resolve, 110) }))
      .then(() => {
        expect(this.dispatched.slice(2)).to.deep.equal([
          { type: 'STOPPED', label: 'a1'},
          { type: 'STOPPED', label: 'a2'},
        ])
      })
  })
})

describe('rootSaga', function() {
  beforeEach(function() {
    let { dispatched, middleware } = setup()
    let task = middleware.run(rootSaga)
    this.dispatched = dispatched
  })

  it('immediately all STARTED actions', function() {
    return Promise.resolve()
      .then(() => {
        expect(this.dispatched).to.deep.equal([
          { type: 'STARTED', label: 'a1'},
          { type: 'STARTED', label: 'a2'},
          { type: 'STARTED', label: 'b1'},
          { type: 'STARTED', label: 'b2'},
        ])
      })
  })

  it('dispatches all STOPPED actions after some time', function() {
    return Promise.resolve()
      .then(() => new Promise((resolve) => { setTimeout(resolve, 110) }))
      .then(() => {
        expect(this.dispatched.slice(4)).to.deep.equal([
          { type: 'STOPPED', label: 'a1'},
          { type: 'STOPPED', label: 'a2'},
          { type: 'STOPPED', label: 'b1'},
          { type: 'STOPPED', label: 'b2'},
        ])
      })
  })
})
