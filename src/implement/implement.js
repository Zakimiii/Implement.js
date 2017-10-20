import { IMPLEMENT_TYPES } from "../constants"
import * as errors from '../errors'

const getType = property => {
  if (Array.isArray(property)) return 'array'

  return typeof property
}

const implementTypedArray = ({ object = {}, typedArray = [], Interface, property }) => {
  const {
    [IMPLEMENT_TYPES.OPTIONS]: { warn = true, error = false, strict = false } = {},
    [IMPLEMENT_TYPES.NAME]: interfaceName
  } = Interface
  const array = object[property]

  // iterate over array
  // for each element, check if it's valid against at least one of the elements inside typedArray
  //   catch errors coming out of each attempt to implement a type or interface from the typedArray?

  typedArray.map(el => {
    const implementsType = el[IMPLEMENT_TYPES.TYPE]
    const implementsInterface = el[IMPLEMENT_TYPES.INTERFACE]

    if ((!el[IMPLEMENT_TYPES.TYPE] || !el[IMPLEMENT_TYPES.INTERFACE]) && strict) {
      error && errors.InvalidArrayElement.throw({
        interfaceName,
        property
      })
    } else if (implementsType) {
      // check if this element matches any of the types inside the array

      // for typedArray.length: implementType()
      implementType({ object: el, property, Interface })
    } else if (implementsInterface) {
      // implement()()
    }
  })
}

const implementType = ({ object,  property,  Interface } = {}) => {
  const {
    [property]: { type: expectedType, array: typedArray } = {},
    [IMPLEMENT_TYPES.NAME]: interfaceName,
    [IMPLEMENT_TYPES.OPTIONS]: { warn = true, error = false } = {}
  } = Interface
  const type = getType(object[property])

  if (type !== expectedType && expectedType !== 'any') {
    warn && errors.InvalidTypeImplementation.warn({
      property,
      interfaceName,
      type,
      expectedType
    })
  }

  if (type === 'array') {
    implementTypedArray({ object, typedArray, Interface, property })
  }
}

const implement = Interface => object => {
  if (process.env.NODE_ENV === 'production') return object

  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      const { [property]: interfaceProp = {}, [IMPLEMENT_TYPES.OPTIONS]: { strict = false } = {} } = Interface
      const { array: typedArray, Interface: NestedInterface, [IMPLEMENT_TYPES.TYPE]: interfaceType } = interfaceProp

      if (!interfaceProp) {
        // if (strict && !trim) throw errors
        // else if (trim) delete prop from obj
        // check strict mode/trim: if (trim) { dont errors }
        // determine whether or not to throw errors
      }

      if (interfaceType && !NestedInterface && !typedArray) {
        implementType({ object, property, Interface })
      } else if (NestedInterface) {
        implement(NestedInterface)(object[property])
      } else if (typedArray) {
        implementTypedArray({ object, typedArray, Interface, property })
      }
    }
  }

  return object
}

export default implement
