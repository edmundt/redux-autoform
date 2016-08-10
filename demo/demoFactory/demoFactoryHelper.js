import DemoFactory from './demoFactory';
import TypeConfig from './constants/TypeConstants';
import { EditComponentFactory } from '../../redux-autoform-bootstrap-ui/src';

export function getDemoFactory() {
    //return new DemoFactory(TypeConfig.edit);
    return EditComponentFactory;
}
