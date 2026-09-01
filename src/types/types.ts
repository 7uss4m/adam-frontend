import { User } from "lucide-react"

export type User = {
  id: number
  // firstname: string
  // lastname: string
  email: string
  balance: number
  user_name: string
  type: string
  provider?: "email" | "google"
  permissions?: string[]
  progress: number
  bonus: number
  level: {
    "id": string,
    "name": string,
    "max": number,
    "profit": number
  },
  debt_coins: null | {
    coins: number,
    expire_limit: number
  }[]
  debit: number
  verify_admin?: boolean
  verify?: boolean
  created_at?: string
  client?: {
    active: boolean
    allowed_ips: null | string
    api_key: string
    balance: number
    created_at: string
    id: string
    name: string
    updated_at: string
    userId: string
  }
  invite_code: string
  invited_by: User
  invited_by_user: User
  invited_users: User[]
  points: number
}

export type Payment = {
  id: number,
  productName: string,
  price: number
}

export type Category = {
  id: number,
  name: string,
  image: string,
  type: "one" | "bundle";
  bonus: number
  available: boolean
  active?: boolean
  order: string
  parent_id?: number | null
  source?: string | null
  external_id?: number | null
  sub_count?: number
  product_count?: number
  profit?: number
  // visible: boolean
}

export type SubCategory = {
  id: number,
  name: string,
  image: string,
  visible: boolean,
  category: string
}

export type Product = {
  id: number,
  name: string,
  image: string,
  active: boolean
  prices: Price[]
  type: "one" | "bundle"
  quantity: number
  categories: { id?: number; name: string; parent_id?: number | null }
  categoryId?: number | string
  source?: string | null
  mainPrice: string
  price: string
  order: string
  offer_active?: boolean
  offer_type?: "percent" | "fixed" | null
  discount_percent?: number | null
  offer_price?: number | null
  offer_start_at?: string | null
  offer_end_at?: string | null
  originalPrice?: number | null
  originalMainPrice?: number | null
  hasOffer?: boolean
  requires: {
    id: number
    name: string
    product_id: number
    question: string
    type: "text" | "quantity" | "selectQty" | "amount"
    type_value: { max: string, min: string } | null
  }[]
  description: string

}

export type Ad = {
  id: number,
  title: string,
  description: string,
  image?: string | File,
  active: boolean
}

export type LoginResponse = {
  user_name: string,
  token: string
}

export type Price = {
  id: string
  price: number
  payment_method: PaymentMethod
  quantity: number
}

export type PaymentMethod = {
  id: string,
  name: string,
  active: boolean,
  image: string
}


export type Order = {
  id: string,
  status: string,
  created_at: string,
  user: User
  price: {
    product: {
      name: string
      categories: {
        name: string
      }
    },
    price: string
  },
  productName: string,
  totalPrice: number,
  email: string
  appId: string
  subCategory: string
  pay_done: boolean
  quantity: string
  total: string,
  isDept: boolean
  product: {
    id: number
    name: string
    price: number
    categories: { name: string }
  },
  replay_api: null | string[] | { replay: string }[]
  client: {
    name: string
  },
  area?: {
    id: string;
    name: string;
  }
}


export type Charge = {
  id: string
  coins: string | number
  type?: string
  done?: boolean
  userId?: string | null
  created_at: string
  user?: {
    email?: string | null
    user_name?: string | null
  } | null
  charged_by?: {
    email?: string | null
    user_name?: string | null
  } | null
}

export type Client = {
  id: string
  name: string
  balance: number
  active: boolean
  created_at: string
  updated_at: string
}
export type Dept = {
  coins: string,
  temp_coins: string,
  expire_limit: number,
  last_used: string | null
  remaining_time: string | null
  user: {
    email: string,
    user_name: string
  }
}


export type Level = {
  id: string
  name: string
  max: number
  profit: string
}

export type Inventory = {
  id: number
  total_quantity: number
  total_price: number
  categories: {
    name: string
  },
  created_at: string
}

export type Report = {
  categoryId: string,
  categoryName: string,
  totalQuantity: number,
  totalPrice: string
}

export type ChargeBox = {
  id: string
  name: string
  account_name: string
  account_code: string
  description: string
  image: string | null | undefined
  currencies: Currency[]
  box_name: string | undefined
  wallet_address: string | undefined
}

export type Currency = {
  id: string
  name: string,
  boxsId: string
}

export type Note = {
  id: string
  image: string
  coins: number
  status: string
  created_at: string
  currencies: {
    name: string
    boxes?: {
      name?: string | null
      box_name?: string | null
      account_name?: string | null
    } | {
      name?: string | null
      box_name?: string | null
      account_name?: string | null
    }[] | null
  }
  user: {
    id: string,
    user_name: string,
    email: string
  }
  currencyName: string
  boxName: string
  username: string
  email: string
}

export type Notification = {
  id: string
  title: string
  content: string
  created_at: string
}

export type Info = {
  email: string | null
  phone: string | null
  privacy: string | null
  aboutus: string | null
  whatsup: string | null
  telegram: string | null
  facebook: string | null
  code: string | null
  dollar_exchange: string | null
}

export type RequireType = "id" | "text" | "amount" | "quantity" | "selectQty";

export type Require = {
  id: number;
  name: string;
  type: RequireType;
  question: string;
  product_id: number;
  type_value: {
    min?: number | string;
    max?: number | string;
    options?: number[];
  } | null;

}
