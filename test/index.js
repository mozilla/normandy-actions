import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';


chai.use(sinonChai);

beforeEach(function() {
    this.sinon = sinon.sandbox.create();
});

afterEach(function(){
    this.sinon.restore();
});
