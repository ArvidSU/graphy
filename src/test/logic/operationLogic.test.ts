import {
  Reference,
  Operation,
} from '../../types/operationTypes';

import {
  resolveValue,
  assignValue,
  evaluateOperation,
} from '../../logic/operationLogic';

const context: Record<string, unknown> = {
  user: {
    profile: {
      settings: {
        theme: 'dark',
      },
    },
  },
};

const ref: Reference = {
  id: 'userProfile',
  name: 'User Profile Theme',
  path: [ 'user', 'profile', 'settings', 'theme' ],
};

const invalidRef: Reference = {
  id: 'invalidPath',
  name: 'Invalid Path',
  path: [ 'user', 'profile', 'nonexistent', 'theme' ],
};

describe( 'resolveValue', () => {

  it( 'should resolve the value correctly for a valid reference', () => {
    const result = resolveValue( context, ref );
    expect( result ).toEqual( {
      value: 'dark',
      name: 'user_profile_theme',
    } );
  } );

  it( 'should resolve objects correctly for a valid reference', () => {
    const settingsRef: Reference = {
      id: 'userSettings',
      name: 'User Settings',
      path: [ 'user', 'profile', 'settings' ],
    };
    const result = resolveValue( context, settingsRef );
    expect( result ).toEqual( {
      value: {
        theme: 'dark',
      },
      name: 'User Settings'.toLowerCase().replace( " ", "_" ).trim(),
    } );
  } );

  it( 'should return undefined for an invalid reference path', () => {
    const result = resolveValue( context, invalidRef );
    expect( result ).toBeUndefined();
  } );

} );

describe( 'assignValue', () => {

  it( 'should assign a value correctly for a valid reference', () => {
    const newValue = 'light';
    const updatedContext = assignValue( context, ref, newValue );
    expect( updatedContext ).toEqual( {
      user: {
        profile: {
          settings: {
            theme: 'light',
          },
        },
      },
    } );
  } );

  it( 'should return undefined for an invalid reference path', () => {
    const result = assignValue( context, invalidRef, 'value' );
    expect( result ).toBeUndefined();
  } );

} );


const operation: Operation = {
  id: 'op1',
  description: 'Test operation',
  inputs: {
    userProfile: ref,
  },
  expression: "user_profile_theme",
  outputs: {},
};

describe( 'evaluateOperation', () => {

  it( 'should evaluate an operation and return the resolved value', () => {
    const result = evaluateOperation( operation, context );
    expect( result ).toEqual( 'dark' );
  } );

  it( 'should return modified context when the operation has outputs', () => {
    const operationWithOutput: Operation = {
      ...operation,
      expression: "\"not \" + user_profile_theme",
      outputs: {
        userProfile: ref,
      },
    };

    const result = evaluateOperation( operationWithOutput, context );
    expect( result ).toEqual( {
      user: {
        profile: {
          settings: {
            theme: 'not dark',
          },
        },
      }
    } );
  } );

} );