import HeaderPedidos from "../../components/headerPedidos";
import Client from "../../components/client";
import Footer from "../../components/Footer/index";
import Cart from "../../components/cart/index";
import Card from "../../components/card";
import { getAllProducts } from "../../services/products";
import "./styles.css";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbarAllDay";
import { createOrder, getOrders, updateStatusOrder } from "../../services/order";
import Order from "../../components/orders";
import Error from "../../components/errors";

function Waitress() {
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("breakfast");
  const [allDayTab, setAllDayTab] = useState("hamburguer");
  const [order, setOrder] = useState([]);
  const [ordersReady, setOrdersReady] = useState([]);
  const [client, setClient] = useState();
  const [table, setTable] = useState();
  const [total, setTotal] = useState();
  const [hasProducts, setHasProducts] = useState(false);
  const [hasAllDay, setHasAllDay] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    getAllProducts().then((data) => {
      const breakfast = data.filter((item) => {
        return item.type === "breakfast";
      });
      const hamburguer = data.filter((item) => {
        return item.sub_type === "hamburguer";
      });
      const drinks = data.filter((item) => {
        return item.sub_type === "drinks";
      });
      const side = data.filter((item) => {
        return item.sub_type === "side";
      });
      const filterProducts = {
        breakfast,
        "all-day": {
          hamburguer,
          drinks,
          side,
        },
      };
      setProducts(filterProducts);
      setHasProducts(true);
    });
  }, []);

  function OrderProduct(product) {
    const productList = order.find((item) => {
      return item.id === product.id;
    });
    if (productList) {
      productList.qtd += 1;
    } else {
      const newList = {
        id: product.id,
        name: product.name,
        price: product.price,
        flavor: product.flavor,
        complement: product.complement,
        qtd: 1,
      };
      order.push(newList);
    }
    setOrder([...order]);
    totalPrice();
  }

  function orderCreate() {
    if (client && table && order) {
      createOrder(client, table, order).then((data) => {
        if (data.code === 400) {
          setError(data.message);
          hideMessage();
        }
        setError("Pedido finalizado com sucesso");
        hideMessage();
        handleReset();
      });
    } else {
      setError("Preencha os campos corretamente");
      hideMessage();
    }
  }

  function handleReset() {
    setClient("");
    setTable("");
    setOrder([]);
    setTotal();
  }

  function hideMessage() {
    setTimeout(() => {
      setError("");
    }, 5000);
  }

  const links = [
    {
      name: "Café da manhã",
      onClick: () => changeStateBreakfast(),
    },
    {
      name: "Dia Todo",
      onClick: () => changeStateAllDay(),
    },
    {
      name: "Pedidos",
      onClick: () => changeStateOrders(),
    },
  ];

  function changeStateBreakfast() {
    setTab("breakfast");
    setHasAllDay(false);
    setHasOrders(false);
  }

  function changeStateAllDay() {
    setTab("all-day");
    setHasAllDay(true);
    setHasOrders(false);
  }

  function changeStateOrders() {
    setTab("pedidos");
    setHasAllDay(false);
    setHasOrders(true);
  }

  useEffect(() => {
    getOrders().then((orders) => {
      const list = [...orders]
      list.sort((a, b) => {
        if (a.status > b.status)
          return -1;
        if (a.status < b.status)
          return 1
        return 0
      });

      let ready = list.filter((item) => item.status === "Pronto" || item.status === "Entregue");
      console.log(ready)
      setOrdersReady(ready);
    });
  }, []);

  const linksAllDay = [
    {
      name: "Hambúgueres",
      onClick: () => setAllDayTab("hamburguer"),
    },
    {
      name: "Bebidas",
      onClick: () => setAllDayTab("drinks"),
    },
    {
      name: "Acompanhamentos",
      onClick: () => setAllDayTab("side"),
    },
  ];

  function updateStatus(element) {
    let orderUpdated = ordersReady.map((item) => {
      if (item.id === element.id) {
        if (item.status === "Pronto") {
          item.status = "Entregue";
        }
        updateStatusOrder(item.id, item.status).then((data) => {
        })
      }
      return item
    });
    return setOrdersReady(orderUpdated)
  }

  function totalPrice() {
    let price = 0;
    order.forEach((product) => {
      price += parseFloat(product.price) * parseFloat(product.qtd);
    });

    return setTotal(price);
  }

  const activeProducts =
    tab === "all-day" ? products[tab][allDayTab] : products[tab];

  return (
    <>
      <HeaderPedidos
        links={links}
      />
      {hasAllDay === true ? <Navbar links={linksAllDay} /> : null}
      {hasOrders === false ?
        <main className="orders">
          <section className="products">
            <ul>
              {hasProducts === true &&
                activeProducts.map((item) => {
                  return (
                    <div className="container-products">
                      <Card
                        key={item.id}
                        product={item}
                        onClick={() => OrderProduct(item)}
                      />
                    </div>
                  );
                })}
            </ul>
          </section>
          <section className="section-cart">
            <div className="client-cart">
              <div className="client-infos">
                <Client
                  onChangeClient={setClient}
                  onChangeTable={setTable}
                  client={client}
                  table={table}
                />
              </div>
              <div className="cart">
                <Cart
                  onClick={() => orderCreate()}
                  orderList={order}
                  total={total}
                  setOrder={setOrder}
                  totalPrice={totalPrice}
                />
                <Error text={error} className="error-waitress" />
              </div>
            </div>
          </section>
        </main>
        :
        <main>
          <section className="container-orders">
            {ordersReady.map((item) => {
              return <Order order={item} onClick={() => updateStatus(item)} />
            })}
          </section>
        </main>
      }
      <Footer />
    </>
  );
}

export default Waitress;
