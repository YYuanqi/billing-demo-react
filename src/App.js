import './App.css'
import React from 'react'
import {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';


// Custom styling can be passed to options when creating an Element.
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

const CheckoutForm = () => {
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  // Handle real-time validation errors from the card Element.
  const handleChange = (event) => {
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // Handle form submission.
  const handleSubmit = async (event) => {
    event.preventDefault();
    const card = elements.getElement(CardElement);
    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: card
    });
    if (result.error) {
      // Inform the user if there was an error.
      setError(result.error.message);
    } else {
      setError(null);
      // Send the token to your server.
      const response = stripeTokenHandler(result.paymentMethod);
      response.then(res => {
        console.log(res)
      })
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="card-element">
          Credit or debit card
        </label>
        <CardElement
          id="card-element"
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleChange}
        />
        <div className="card-errors" role="alert">{error}</div>
      </div>
      <button type="submit">Submit Payment</button>
    </form>
  )
};

const SubscribeButton = () => {
    // Handle button click.
    const handleClick = async () => {
      console.log('handleClick');
      const product_id = 'prod_H3PzVr5ns3o7km';
      const pricing_plan = 'plan_H3PzwfOpZoW9sL';
      const response = stripeSubscriptionHandler(product_id, pricing_plan);
      response.then(res => {
        console.log(res)
      })
    };

    return (
      <button onClick={() => handleClick()}>Subscribe GSH(300 JPY/Month)</button>
    )
  }
;

// Setup Stripe.js and the Elements provider
const stripePromise = loadStripe('pk_test_ihxb7YntjUWqUPXg2IkmusTe00kSfF5xvh');

const App = () => {
  return (
    <div>
      <Elements stripe={stripePromise}>
        <CheckoutForm/>
      </Elements>
      <SubscribeButton/>
    </div>
  );
};

// POST the token ID to your backend.
async function stripeTokenHandler(token) {
  console.log(token);
  const response = await fetch('http://localhost:2999/api/billing/payment_methods', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({card_token: token.id})
  });

  return response.json();
}

async function stripeSubscriptionHandler(productId, pricingPlan) {
  const response = await fetch('http://localhost:2999/api/billing/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      pricing_plan: pricingPlan
    })
  });

  return response.json();
}

export default App;
