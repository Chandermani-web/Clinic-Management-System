// src/hooks/useFetchTokens.js
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../Firebase/Firebase"; // adjust if needed
import { setTokensFromFirebase } from "../Store/AssignToken.Slice"; // update path

const useFetchTokens = () => {
  const [tokenList, setTokenList] = useState([]);
  const dispatch = useDispatch();
  const database = getDatabase(app);

  useEffect(() => {
    const dataRef = ref(database, "assigntokens");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.entries(data)
          .map(([id, value]) => ({
            id,
            ...value,
          }));

        setTokenList(formattedData);
        dispatch(setTokensFromFirebase(formattedData));
        sessionStorage.setItem("tokens", JSON.stringify(formattedData));
      } else {
        setTokenList([]);
        dispatch(setTokensFromFirebase([]));
        sessionStorage.setItem("tokens", JSON.stringify([]));
      }
    });

    return () => unsubscribe();
  }, [dispatch, database]);

  return tokenList;
};

export default useFetchTokens;