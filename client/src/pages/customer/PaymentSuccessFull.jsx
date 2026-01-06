import { CheckCircle } from "lucide-react"; 
import { Link } from "react-router-dom";

 const PaymentSuccessFull= () => (
    <div className="max-w-xl mx-auto text-center pt-12 pb-20">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        Thank you for your purchase. We have received your order and are getting
        it ready for shipment.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/products"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );

  export default PaymentSuccessFull