/**
 * Created by lents on 7/15/16.
 */
import Store from 'react-native-store'
import {captina} from './api/captina-api.json'

const Storage = {
  'captina': Store.model('captina'),
}

export const initStorage = () => {
  Storage.captina.add({
        nothing: 'something',
        another: 'thing'
      })
      .then(() => console.log('Added things'))
}

export const checkStoredRegistration = () => {
  Storage.captina.find({
        fields: {
          nonceHeader: true,
          hexKey: true,
          domain: true
        }
      })
      .then(resp => console.dir({storage: resp}))
}

export const removeStorage = () => {
  Storage.foo.remove()
      .then(console.log('Destroyed'))
}


