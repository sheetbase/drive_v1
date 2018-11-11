// tslint:disable:no-unused-expression
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { drive } from '../src/public_api';
import { contentFolder } from '../src/example';

const Drive = drive({
    contentFolder,
});

describe('Drive module test', () => {

    it('Drive service should be created', () => {
        expect(Drive).to.be.not.null;
    });

});