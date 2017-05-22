/**
 * Created by lents on 6/9/16.
 */
import {Record} from 'immutable'
import productBase from '../lib/productBase'

const catalogItem = {
   ...productBase,
   avail: '',
   avail_base: '',
   cat_sizes: '',
   custom_qtys: '1',
   package_size: '',
   pdf_filename: '',
   popup_message: '',
   pricing: '',
   sold_out: null,
   w_coupon_str: '',
   cluster_name: '' // added for UI
}

class CatalogItem extends Record(catalogItem) {
   // constructor() {
   //    super( catalogItem )
   // }
}

export default CatalogItem

