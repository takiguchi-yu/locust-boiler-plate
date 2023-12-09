import random
import time

from locust import HttpUser, between, events, task


# 設定した rps を超過しないように sleep を入れて制限する
class RateLimiter:
    def __init__(self, rate):
        self.rate = rate
        self.start_time = time.time()
        self.request_count = 0

    def delay(self):
        self.request_count += 1
        elapsed = time.time() - self.start_time
        expected_time = self.request_count / self.rate
        sleep_time = expected_time - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)

rate_limiter = RateLimiter(15)  # 15 rps

@events.request.add_listener
def on_request(**kwargs):
    rate_limiter.delay()

# 本処理
class GurunaviApiUser(HttpUser):
    # タスク間の待機時間が 1 秒から 2 秒の間にランダムに設定（wait_time という変数自体は locust 内部で利用される）
    wait_time = between(1, 2)

    # ユーザーが TaskSet の実行を開始するときに呼び出される
    def on_start(self):
        api_keys = [
            'abc',
            'def',
        ]
        api_key = random.choice(api_keys)
        self.client.headers.update({'x-api-key': api_key})

    # シナリオ1
    @task(9)    # 数字はタスク実行の比率
    def get_pet(self):
        query_prams_list = [
            {'limit': 1, 'offset': 10},
            {}
        ]
        query_params = random.choice(query_prams_list)
        self.client.get("/pet", params=query_params)

    # シナリオ2
    @task(1)
    def get_pet_findbystatus(self):
        self.client.get('/pet/findByStatus')
