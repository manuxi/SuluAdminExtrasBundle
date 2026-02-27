// @flow
const fieldTypeDefaultProps = {
    data: {},
    dataPath: '/',
    defaultType: undefined,
    disabled: undefined,
    error: undefined,
    fieldTypeOptions: {},
    formInspector: {
        isFieldModified: jest.fn(),
        getSchemaEntryByPath: jest.fn(),
        getValueByPath: jest.fn(),
        locale: undefined,
        options: {},
    },
    label: 'Test Label',
    maxOccurs: undefined,
    minOccurs: undefined,
    onChange: jest.fn(),
    onFinish: jest.fn(),
    onSuccess: undefined,
    router: undefined,
    schemaOptions: {},
    schemaPath: '/',
    showAllErrors: false,
    types: undefined,
    value: undefined,
};

export default fieldTypeDefaultProps;
