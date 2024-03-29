import React, { useRef, useEffect, useState } from "react";
import { View, SafeAreaView, Dimensions, ScrollView, ActivityIndicator } from 'react-native';

import TopBar from "../components/TopBar";
import BarChildrenBottomButton from "../components/BarChildrenBottomButton";
import SwitchScreen from "../components/SwitchScreen";
import Products from "../components/Products";
import AddButton from "../components/AddButton";
import Historico from "../components/Historico";
import Products404 from "../components/Products404";

import productsGet from "../utils/products/requests/productsGet";
import historicoGet from "../utils/historico/requests/historicoGet"

import { colors, styles } from "../styles/global-style";

export default function Home({ navigation }) {
  const scrollref = useRef(null);
  const { width } = Dimensions.get("screen");
  const [produtosFromDB, setprodutosFromDB] = useState([]);
  const [produtos, setprodutos] = useState([])
  const [historicoFromDB, sethistoricoFromDB] = useState([]);
  const [historico, sethistorico] = useState([]);
  const [pesquisa, setpesquisa] = useState('');
  const [load, setLoad] = useState(false);

  const handleScroll = x => scrollref.current.scrollTo({ x: x });
  const handleProducts = async () => setprodutosFromDB(await productsGet());
  const handleHistorico = async () => sethistoricoFromDB(await historicoGet());
  const handleNavigateCadastro = () => navigation.navigate('Cadastro', { 'Edit': null, 'Produto': null });
  const handleChangePesquisa = pesquisa => setpesquisa(pesquisa);

  useEffect(() => {
    handleProducts()
    handleHistorico()
  }, [produtos, historico]);

  useEffect(() => navigation.addListener('focus', async () => {
    setLoad(true);
    await handleProducts()
    await handleHistorico()
    setLoad(false);
  }));

  useEffect(() => {
    let filtroNomeProduto = produtosFromDB.filter((item) => {
      return item.nome.toLowerCase().includes(pesquisa.toLowerCase())
    })

    let filtroIdProduto = produtosFromDB.filter((item) => {
      return item.id == pesquisa
    })

    let filtroNomeHistorico = historicoFromDB.filter((item) => {
      return item.nome.toLowerCase().includes(pesquisa.toLowerCase())
    })

    let filtroIdHistorico = historicoFromDB.filter((item) => {
      return item.produto_id == pesquisa
    })

    let filtroDataHistorico = historicoFromDB.filter((item) => {
      return item.data.includes(pesquisa)
    })

    if (filtroNomeProduto.length > 0) {
      setprodutos(filtroNomeProduto)
      sethistorico(filtroNomeHistorico)
    }

    else if (filtroIdProduto.length > 0) {
      setprodutos(filtroIdProduto)
      sethistorico(filtroIdHistorico)
    }

    else if (filtroDataHistorico.length > 0) {
      sethistorico(filtroDataHistorico)
    }

  }, [pesquisa]);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar eventChange={handleChangePesquisa} val={pesquisa} />

      <View style={styles.switchButtons}>
        <BarChildrenBottomButton text={"Produtos"} eventPress={() => handleScroll(0)} />
        <BarChildrenBottomButton text={"Histórico"} eventPress={() => handleScroll(width)} />
      </View>

      <ScrollView horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false}
        decelerationRate={0.99} ref={scrollref} >
        {load
          ? <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.blue} />
          </View> :





          <>
            <SwitchScreen conteudo={

              pesquisa ?
                produtos.map((produto) => {
                  return <Products
                    event={() => navigation.navigate('Operacao', produto)}
                    key={produto.id}
                    produto={produto}
                  />
                })
                :
                (
                  produtosFromDB.length > 0 ?
                    produtosFromDB.map((produto) => {
                      return <Products
                        event={() => navigation.navigate('Operacao', produto)}
                        key={produto.id}
                        produto={produto}
                      />
                    })
                    :
                    <Products404 src={require('../assets/Products404.png')} />
                )
            } />

            <SwitchScreen
              hist={true}
              conteudo={
                pesquisa ?
                  historico.map((historico) => {
                    return <Historico
                      key={historico.id}
                      dados={historico}
                    />
                  })
                  :
                  historicoFromDB.map((historico) => {
                    return <Historico
                      key={historico.id}
                      dados={historico}
                    />
                  })
              }
            />
          </>
        }


      </ScrollView>
      <AddButton eventPress={handleNavigateCadastro} />
    </SafeAreaView>
  );
}