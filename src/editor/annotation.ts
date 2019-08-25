import { Annotation } from '../core/editor'
import { KEY_REG } from '../utils'

class AnnotationProvider extends Annotation {
  get KEY_REG() {
    return KEY_REG
  }
}

export const annotationEditor = () => {
  const annotation = new AnnotationProvider()
  return annotation.disposables
}
