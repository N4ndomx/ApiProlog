import { getConnection, mysql, querys } from "../Database/index.js";
import * as app from "express";
import { config } from "dotenv";
import tauProlog from "tau-prolog";

config();

export const ConsultarProlog = async (req, res) => {
  (async () => {
    const valores = req.body;
    const caracteristicas = valores.buscar;

    const arrayNo = valores.arrayNo;

    try {
      const session = tauProlog.create();

      const program = `
      % Hechos de personajes y caracteristiacas
          
      personaje(spiderman, [humano, hombre, heroe, aracnido, trepamuros]).
      personaje(ironman, [humano, hombre, heroe, genio_inventor, millonario]).
      personaje(capita_america, [humano, hombre, heroe, patriota, super_soldado]).
      personaje(daredevil, [humano, hombre, heroe, ciego, artista_marcial]).
      personaje(black_widow, [humano, mujer, heroe, espia, artista_marcial]).
      personaje(sue_storm, [humano, mujer, heroe, invisible, fuerte]).
      personaje(silk, [humano, mujer, heroe, tejedora, trepamuros]).
      personaje(she_hulk, [humano, mujer, heroe, verde, super_fuerte]).
      personaje(scarlet_witch, [humano, mujer, heroe, hechicera, fuerte]).
      personaje(jean_grey, [mutante, mujer, heroe, telepata, dark_fenix]).
      personaje(punisher, [humano, hombre, antiheroe, vengativo, artista_marcial]).
      personaje(deadpool, [mutante, hombre, antiheroe, mercenario, gracioso]).
      personaje(venom, [alien, hombre, antiheroe, aracnido, simbionte]).
      personaje(wolverine, [mutante, hombre, antiheroe, salvaje, inmortal]).
      personaje(x_23, [mutante, mujer, antiheroe, experta_rastreadora, clon]).
      personaje(thanos, [alien, hombre, villano, titan, loco]).
      personaje(magneto, [mutante, hombre, villano, defensor_de_mutantes, poderoso]).
      personaje(hela, [alien, mujer, villano, diosa_de_la_muerte, super_fuerte]).
      personaje(la_encantadora, [alien, mujer, villano, hechicera, manipuladora]).
      personaje(deathbird, [alien, mujer, villano, princesa, conquistadora]).
          
      member(X, [X|_]).
      member(X, [_|Tail]) :- member(X, Tail).
          
      % Regla para verificar si un personaje cumple con ciertas características
      cumple_caracteristicas(Personaje, Caracteristicas) :-
          personaje(Personaje, ListaCaracteristicas),
          forall(member(Caracteristica, Caracteristicas), member(Caracteristica, ListaCaracteristicas)).
          
      % Regla para obtener los personajes que cumplen con todas las características dadas
      obtener_personajes(Caracteristicas, Personajes) :-
          findall(Personaje, cumple_caracteristicas(Personaje, Caracteristicas), Personajes).
      `;

      const goal = `obtener_personajes([${caracteristicas}], Personajes).`;
      let sentResponse = false;
      let result = [];

      const show = async (x) => {
        if (!sentResponse) {
          sentResponse = true;
          let re = session.format_answer(x);
          result.push(re);
        }
      };

      await new Promise((resolve) => {
        session.consult(program, {
          success: () => {
            session.query(goal, {
              success: () => {
                session.answers(show);
                resolve();
              },
            });
          },
        });
      });

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 0);
      });

      const formato = /\[(.*?)\]/;

      const formatovalores = formato.exec(result);

      let personajes;

      if (formatovalores && formatovalores.length > 1) {
        const personajesString = formatovalores[1];

        personajes = personajesString.split(",");
      }

      var mandarPersonaje = ["" + personajes.join(",") + ""];
      var mandarFiltro = ["" + arrayNo + ""];
      if (personajes.length > 1) {
        res.json(
          await randomCaracteristicas({
            params: { personajes: mandarPersonaje, filtrar: mandarFiltro },
          })
        );
      } else {
        let mandar = personajes[0];
        console.log(mandar);
        res.json(
          await ConsulatCharacterByNombre({ params: { personaje: mandar } })
        );
      }
    } catch (error) {
      res.status(500);
      res.send(error.message);
    }
  })();
};

export const ConsultarTodo = async (req, res) => {
  try {
    const pool = await getConnection();

    let obtenerPersonajes = await pool.execute(querys.verPersonajes);

    var personajesCaracteristicas = obtenerPersonajes[0].map(
      (personajes) => personajes.caracteristicas_personaje
    );

    var arrayCaracteristicas = personajesCaracteristicas.reduce(
      (objeto, elemento) => {
        const caracteristica = elemento.split(",");
        return { caracteristica: objeto.caracteristica.concat(caracteristica) };
      },
      { caracteristica: [] }
    );

    const filtrarCaracteristicas = arrayCaracteristicas.caracteristica.filter(
      (valor, indice) => {
        return arrayCaracteristicas.caracteristica.indexOf(valor) === indice;
      }
    );

    const numeroRandom = Math.floor(
      Math.random() * filtrarCaracteristicas.length
    );
    const caracteristicaRandom = filtrarCaracteristicas[numeroRandom];

    res.json(caracteristicaRandom);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

export const ConsulatCharacterByNombre = async (req, res) => {
  const { personaje } = req.params;
  console.log(personaje);
  try {
    const pool = await getConnection();

    const query = querys.CharacterByName;

    const values = [personaje];

    const [result] = await pool.execute(query, values);
    return result[0];
  } catch (error) {}
};

export const randomCaracteristicas = async (req, res) => {
  const { personajes, filtrar } = req.params;
  try {
    const pool = await getConnection();
    const query = querys.Obtener;
    const personajesCaracteristicas = [];
    const values = personajes[0].split(",");

    for (let i = 0; i < values.length; i++) {
      const dato = [values[i]];
      const [result] = await pool.execute(query, dato);
      personajesCaracteristicas.push(result[0]);
    }

    const arrayCaracteristicas = {
      caracteristicas_personaje: personajesCaracteristicas
        .map((obj) => obj.caracteristicas_personaje)
        .join(","),
    };

    const filtrarCaracteristicas = {
      caracteristicas_personaje: Array.from(
        new Set(arrayCaracteristicas.caracteristicas_personaje.split(","))
      ).join(","),
    };

    const filtrarArray = filtrar[0].split(",");
    const filtrarArraySinEspacios = filtrarArray.map((valor) => valor.trim());

    const filtrooo =
      filtrarCaracteristicas.caracteristicas_personaje.split(",");

    const arregloUnico = filtrarArraySinEspacios
      .filter((valor) => !filtrooo.includes(valor))
      .concat(
        filtrooo.filter((valor) => !filtrarArraySinEspacios.includes(valor))
      );

    const numeroRandom = Math.floor(Math.random() * arregloUnico.length);
    const caracteristicaRandom = arregloUnico[numeroRandom];

    return caracteristicaRandom;
  } catch (error) {}
};
