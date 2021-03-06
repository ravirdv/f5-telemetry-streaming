/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

const assert = require('assert');

const dataTagging = require('../../src/lib/dataTagging');
const dataTaggingTestsData = require('./dataTaggingTestsData.js');


describe('Data Tagging', () => {
    describe('handleAction', () => {
        const getCallableIt = testConf => (testConf.testOpts && testConf.testOpts.only ? it.only : it);

        dataTaggingTestsData.handleAction.forEach((testConf) => {
            getCallableIt(testConf)(testConf.name, () => {
                dataTagging.handleAction(testConf.dataCtx, testConf.actionCtx);
                assert.deepStrictEqual(testConf.dataCtx, testConf.expectedCtx);
            });
        });

        it('should make deep copy of tag\'s value (example 1)', () => {
            const actionCtx = {
                enable: true,
                setTag: {
                    tag: {
                        key: 'value'
                    }
                }
            };
            const dataCtx = {
                data: {
                    foo: 'bar'
                }
            };
            const expectedCtx = {
                data: {
                    foo: 'bar',
                    tag: {
                        key: 'value'
                    }
                }
            };
            dataTagging.handleAction(dataCtx, actionCtx);
            delete actionCtx.setTag.tag.key;
            // data with injected tag should be not affected
            assert.deepStrictEqual(dataCtx, expectedCtx);
        });

        it('should make deep copy of tag\'s value (example 2)', () => {
            const actionCtx = {
                enable: true,
                setTag: {
                    tag: {
                        key: 'value'
                    }
                },
                locations: {
                    virtualServers: {
                        '.*': true
                    }
                }
            };
            const dataCtx = {
                data: {
                    virtualServers: {
                        vs1: {},
                        vs2: {}
                    }
                }
            };
            const expectedCtx = {
                data: {
                    virtualServers: {
                        vs1: {
                            tag: {
                                key: 'value'
                            }
                        },
                        vs2: {
                            tag: {
                                key: 'value'
                            }
                        }
                    }
                }
            };
            dataTagging.handleAction(dataCtx, actionCtx);
            delete actionCtx.setTag.tag.key;
            // data with injected tag should be not affected
            assert.deepStrictEqual(dataCtx, expectedCtx);
            // data with injected tag should be not affected
            dataCtx.data.virtualServers.vs1.tag.key = 'newValue';
            assert.strictEqual(dataCtx.data.virtualServers.vs2.tag.key, 'value');
        });
    });
});
