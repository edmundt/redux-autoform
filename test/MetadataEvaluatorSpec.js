const chai = require('chai');
const MetadataEvaluator = require('../src/metadata/evaluator/MetadataEvaluator.js');
const log = require('./utils/log');
const assert = chai.assert;

describe('MetadataEvaluator', function () {
    
    describe('evaluate', function () {
        it('DefaultMetadataFilter with literals', function () {
            let metadata = {
                name: 'name',
                required: true
            };
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre'});
            assert.strictEqual('name', metadataEvaluation.name);
            assert.isTrue(metadataEvaluation.required);

        });
        it('DefaultMetadataFilter with a function, returning true', function () {
            let metadata = {
                name: 'Andre',
                required: m => m.number > 500
            };
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 3445});
            assert.strictEqual('Andre', metadataEvaluation.name);
            assert.isTrue(metadataEvaluation.required);
        });
        it('DefaultMetadataFilter with a function, returning false', function () {
            let metadata = {
                name: 'Andre',
                required: m => m.number < 500
            };
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 3445});
            assert.strictEqual('Andre', metadataEvaluation.name);
            assert.isFalse(metadataEvaluation.required);
        });
        it('DefaultMetadataFilter with a function, when the property starts with an underscore', function () {
            let metadata = {
                name: 'Andre',
                $required: m => m.number < 500
            };
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 3445});
            assert.strictEqual('Andre', metadataEvaluation.name);
            assert.isFunction(metadataEvaluation.$required);
        });
        it('DefaultMetadataFilter with a function, passing an array', function () {
            let metadata = [{
                name: 'Andre',
                required: m => m.number > 500
            }, {
                name: 'Joseph',
                required: m => m.number > 1000
            }];
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 3445});
            assert.strictEqual('Andre', metadataEvaluation[0].name);
            assert.isTrue(metadataEvaluation[0].required);
            assert.strictEqual('Joseph', metadataEvaluation[1].name);
            assert.isTrue(metadataEvaluation[1].required);
        });
        it('ConditionMessageFilter, when there is one and one truthy', function () {
            // let metadata = {
            //     name: 'name',
            //     required: true,
            //     invalid: [
            //         {
            //             condition: m => m.name == 'Andre',
            //             message: 'Name should not be andre'
            //         }
            //     ]
            // };
            // let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre'});
            // assert.strictEqual('name', metadataEvaluation.name);
            // assert.isTrue(metadataEvaluation.invalid.value);
            // assert.strictEqual('Name should not be andre', metadataEvaluation.invalid.message);
        });
        it('ConditionMessageFilter, when there is multiple and one truthy', function () {
            // let metadata = {
            //     name: 'name',
            //     required: true,
            //     invalid: [
            //         {
            //             condition: m => m.name == 'John',
            //             message: 'Name should not be andre'
            //         },
            //         {
            //             condition: m => m.number === 1000,
            //             message: 'Number should not be 1000'
            //         }
            //     ]
            // };
            // let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 1000});
            // assert.strictEqual('name', metadataEvaluation.name);
            // assert.isTrue(metadataEvaluation.invalid.value);
            // assert.strictEqual('Number should not be 1000', metadataEvaluation.invalid.message);
        });
        it('ConditionMessageFilter, when there is multiple and not a truthy', function () {
            // let metadata = {
            //     name: 'name',
            //     required: true,
            //     invalid: [
            //         {
            //             condition: m => m.name == 'John',
            //             message: 'Name should not be andre'
            //         },
            //         {
            //             condition: m => m.number === 400,
            //             message: 'Number should not be 1000'
            //         }
            //     ]
            // };
            // let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre', number: 1000});
            // assert.strictEqual('name', metadataEvaluation.name);
            // assert.isFalse(metadataEvaluation.invalid.value);
        });
        it('Checking for a required property, when not passing', function () {
            // let metadata = {
            //     name: 'name',
            //     required: true
            // };
            // let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: ''});
            // assert.strictEqual('name', metadataEvaluation.name);
            // assert.isTrue(metadataEvaluation.required);
            // assert.isTrue(metadataEvaluation.invalid.value);
            // assert.strictEqual(metadataEvaluation.invalid.message, 'The field \'name\' is required');
        });
        it('Checking for a required property, when passing', function () {
            // let metadata = {
            //     name: 'name',
            //     required: true
            // };
            // let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {name: 'Andre'});
            // assert.strictEqual('name', metadataEvaluation.name);
            // assert.isTrue(metadataEvaluation.required);
            // assert.isUndefined(metadataEvaluation.invalid);
        });
        it('Should work with entities', function () {
            let metadata = {
                name: 'phone',
                type: 'entity',
                fields: [
                    {
                        name: 'number'
                    },
                    {
                        name: 'longDistanceCode'
                    }
                ]
            };
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata,
                {
                    phone: {
                        number: '99168204',
                        longDistanceCode: 200
                    }
                });
            assert.strictEqual(metadataEvaluation.name, 'phone');
            assert.strictEqual(metadataEvaluation.type, 'entity');
            assert.strictEqual(metadataEvaluation.fields.length, 2);
        });
        it('Should work with inner entities', function () {
            let metadata = {
                name: 'phone',
                type: 'entity',
                fields: [
                    {
                        name: 'number'
                    },
                    {
                        name: 'carrier',
                        type: 'entity',
                        entityName: 'carrier',
                        fields: [
                            {
                                name: 'code',
                                type: 'int'
                            },
                            {
                                name: 'plan',
                                type: 'string'
                            }
                        ]
                    }
                ]
            };
            let metadataIndex = {};
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata,
                {
                    phone: {
                        number: '99168204',
                        carrier: {
                            code: "51",
                            plan: 'smart'
                        }
                    }
                }, '', metadataIndex );
            
            
        });
        it('Should work with of arrays', function () {
            let metadata = {
                name: 'phones',
                type: 'array',
                arrayType: 'entity',
                entityType: 'phone',
                fields: [
                    {
                        name: 'number',
                        newFormat: p => p.number.length > 8
                    },
                    {
                        name: 'longDistanceCode'
                    }
                ]
            };

            let metadataEvaluation = MetadataEvaluator.evaluate(metadata,
                {
                    phones: [
                        {
                            longDistanceCode: 32,
                            number: '99182938'
                        },
                        {
                            longDistanceCode: 21,
                            number: '999291102'
                        }
                    ]
                });
        });
        it('Should work with of arrays of arrays', function () {
            let metadata = {
                name: 'contacts',
                type: 'array',
                arrayType: 'entity',
                entityType: 'contact',
                fields: [
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'phones',
                        type: 'array',
                        arrayType: 'entity',
                        entityType: 'phone',
                        fields: [
                            {
                                name: 'number',
                                newFormat: p => p.number.length > 8
                            },
                            {
                                name: 'longDistanceCode'
                            }
                        ]
                    }
                ]
            };

            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {
                contacts: [
                    {
                        name: 'Andre',
                        phones: [
                            {
                                longDistanceCode: 32,
                                number: '99168204'
                            },
                            {
                                longDistanceCode: 21,
                                number: '988934510'
                            }
                        ]
                    },
                    {
                        name: 'Miguel',
                        phones: [
                            {
                                longDistanceCode: 32,
                                number: '99182938'
                            },
                            {
                                longDistanceCode: 21,
                                number: '999291102'
                            }
                        ]
                    }
                ]
            }, '');

        });
        
        it('Should process redux props - Simple props', function() {
            
            let metadata = [{
                name: 'contacts',
                type: 'array',
                arrayType: 'entity',
                entityType: 'contact',
                fields: [
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'phones',
                        type: 'array',
                        arrayType: 'entity',
                        entityType: 'phone',
                        fields: [
                            {
                                name: 'number',
                                newFormat: p => p.number.length > 8
                            },
                            {
                                name: 'longDistanceCode'
                            }
                        ]
                    }
                ]
            },{
                name: 'phone',
                type: 'entity',
                entityType: 'phone',
                fields: [
                    {
                        name: 'number',
                        type: 'string'
                    }
                ]
            }];
            
            let reduxProps = {
                phone: {
                    number: {
                        x: 0
                    }
                },
                contacts: [
                    {
                        name: {
                            x: 1
                        }
                    },
                    {
                        name: {
                            x: 2
                        }
                    }
                ]
            };
            
            let metadataEvaluation = MetadataEvaluator.evaluate(metadata, {
                phone: {
                    number: '553299168204'
                },
                contacts: [
                    {
                        name: 'andre',
                        
                    },
                    {
                        name: 'john'
                    }
                ]
            }, '', reduxProps);
        });
    });
});