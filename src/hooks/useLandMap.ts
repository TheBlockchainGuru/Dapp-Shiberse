import axios from "axios"
import { apiServer, mapLandDataUrl, mapLandPriceDataUrl } from "constants/map"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from 'state'
import { updateSearchOptions } from 'state/map/actions'

const useLandMap = () => {
    const [landData, setLandData] = useState([])
    const [landPriceData, setLandPriceData] = useState({}) as any
    const [isLandDataLoaded, setIsLandDataLoaded] = useState(false)
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(1)

    const searchOptions = useSelector<AppState, AppState['map']['searchOptions']>(state => state.map.searchOptions)

    const dispatch = useDispatch<AppDispatch>()

    const setSearchOptions = (newOptions: any): any => dispatch( updateSearchOptions( { newOptions } ) )

    const fetchInfo = useCallback(async () => {
        const result = await fetch(mapLandDataUrl)
		const json_data = await result.json()

		const result_data = json_data.filter((item: any) => item.tierName !== 'locked')
		setLandData(result_data)

		const response = await axios.get(mapLandPriceDataUrl)
        const arrayData = response.data
        
        let minPrice: any, maxPrice: any

        const objectData = {} as any
        arrayData.forEach((item: any) => {
            objectData[item.id] = {
                ...item
            }

            if( !minPrice && !maxPrice ) {
                minPrice = item.price
                maxPrice = item.price
            } else {
                if( Number(minPrice) > Number(item.price) )
                    minPrice = Number(item.price)
                if( Number(maxPrice) < Number(item.price) )
                    maxPrice = Number(item.price)
            }
        })
        setLandPriceData( objectData )

        const oldOption = { ...searchOptions }
        oldOption.minPrice = Number(minPrice)
        oldOption.maxPrice = Number(maxPrice)
        oldOption.searchMinPrice = Number(minPrice)
        oldOption.searchMaxPrice = Number(maxPrice)
        setSearchOptions(oldOption)

        setIsLandDataLoaded(true)

        setMinPrice(Number(minPrice))
        setMaxPrice(Number(maxPrice))

        console.error(arrayData)
    }, [setLandData, setLandPriceData])

    useEffect(() => {
        fetchInfo()
    }, [setLandData, setLandPriceData])

    const updatePriceData = (newData: any) => {
        setLandPriceData((prev: any) => ({...prev, ...newData}))
    }

    return { landData, landPriceData, updatePriceData, isLandDataLoaded, minPrice, maxPrice }
}

export default useLandMap