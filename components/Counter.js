import React, {useState} from "react";

export default function Counter(){
    const [count, setCount] = useState(0);

    return(
        <div>
            <h2>Giá trị hiện tại: {count}</h2>
            <button onClick= {()=> setCount( count + 1 ) }>+</button>
            <button onClick= {()=> setCount( count - 1 )}>-</button>
        </div>
    )
}

