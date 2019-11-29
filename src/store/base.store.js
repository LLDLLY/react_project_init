import { observable, action } from 'mobx'

class BaseStore {

  @observable test = 'test';

  @action
  handleTest() {
    console.log('mobx init SUCCESS !')
  }

}

export default new BaseStore();