import { useQuery } from "@tanstack/react-query"
import getNotifications from "../api/getNotifications"
import { Notification } from "../types/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import Spinner from "../components/Spinner"
import { useTranslation } from "react-i18next"

export default function Notifications() {
  // translations
  const [t,] = useTranslation("global")
  // query
  const getNotificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await getNotifications(localStorage.getItem("token") as string)
     
      return response.data.result as Notification[]
    }
  })
  return (
    <div className="relative z-10">
      {getNotificationsQuery.isLoading ?
        <div className="min-h-[50vh] flex justify-center items-center">
          <Spinner />
        </div> :
        getNotificationsQuery.data && getNotificationsQuery.data?.length > 0 ? getNotificationsQuery.data?.map((notification) => (
          <div className="container max-w-[100%] md:max-w-[90%] lg:max-w-[70%] gap-5">
            <Card className="bg-accent border-0">
              <CardHeader>
                <CardTitle>{notification.title}</CardTitle>
              </CardHeader>
              <CardContent>{notification.content}</CardContent>
              <CardFooter>{notification.created_at.slice(0, 9)}</CardFooter>
            </Card>
          </div>
        )) : <div className="min-h-[50vh] flex justify-center items-center">
          <span className="text-accent">{t("no_notifications")}</span>
        </div>}
    </div>
  )
}